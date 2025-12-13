// angular import
import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// third party
import { HttpClient } from '@angular/common/http';

// project import

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/core/services/alert.service';
import { AuthService } from 'src/app/core/services/auth.service';

// icons
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { HeartOutline, MessageOutline, PictureOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-sample-page',
  imports: [CommonModule, IconDirective, FormsModule],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export class SamplePageComponent implements OnInit {
  private http = inject(HttpClient);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);
  private alertService = inject(AlertService);
  private authService = inject(AuthService);

  posts: any[] = [];
  isLoading = false;
  errorMessage = '';
  reactingMap: Record<string, boolean> = {};
  commentSubmittingMap: Record<string, boolean> = {};
  commentInputs: Record<string, string> = {};

  // Post form
  postContent = '';
  postTitle = '';
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  private imageObjectUrl: string | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    this.iconService.addIcon(HeartOutline, MessageOutline, PictureOutline);
    this.loadPosts();
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Revoke previous object URL to avoid leaks
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
    }

    this.selectedImage = file;
    this.imageObjectUrl = URL.createObjectURL(file);
    this.selectedImagePreview = this.imageObjectUrl;
  }

  removeImage(): void {
    if (this.imageObjectUrl) {
      URL.revokeObjectURL(this.imageObjectUrl);
      this.imageObjectUrl = null;
    }
    this.selectedImage = null;
    this.selectedImagePreview = null;
  }

  submitPost(): void {
    if (!this.postContent.trim()) {
      this.alertService.error('Content cannot be empty');
      return;
    }

    const { currentUser, userId, campusId, campusIdRaw } = this.resolveUserContext();

    console.log('Post submit debug user', { currentUser, userId, campusId, campusIdRaw });

    if (!userId || campusId === undefined || Number.isNaN(campusId)) {
      this.alertService.error('User information is missing');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('content', this.postContent.trim());
    formData.append('author_id', String(userId));
    formData.append('campus_id', String(campusId));
    if (this.postTitle.trim()) {
      formData.append('title', this.postTitle.trim());
    }
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const payloadForLog = {
      content: this.postContent.trim(),
      author_id: String(userId),
      campus_id: String(campusId),
      title: this.postTitle.trim() || null,
      image: this.selectedImage ? `[file:${this.selectedImage.name}]` : null
    };

    console.log('Post submit payload', payloadForLog);

    this.http.post(`${environment.apiUrl}/post`, formData).subscribe({
      next: (response: any) => {
        console.log('Post created:', response);
        this.alertService.success('Post created successfully!');
        this.postContent = '';
        this.postTitle = '';
        this.removeImage();
        this.isSubmitting = false;
        this.loadPosts(); // Reload posts
      },
      error: (error) => {
        console.error('Create post error:', { error, payload: payloadForLog });
        const backendMessage = error?.error?.message;
        const status = error?.status;
        const friendly = status === 0 ? 'Network error. Please check your connection.' : backendMessage || 'Failed to create post';
        this.alertService.error(friendly);
        this.isSubmitting = false;
      }
    });
  }

  getAuthorName(post: any): string {
    const parts = [post?.first_name, post?.middle_name, post?.last_name];
    const authorObj = post?.author ?? post?.user;
    if (authorObj) {
      parts.push(authorObj.first_name, authorObj.middle_name, authorObj.last_name);
    }

    const name = parts
      .filter((part) => !!part && String(part).trim().length)
      .map((part) => String(part).trim())
      .join(' ')
      .trim();

    return name || 'Unknown author';
  }

  getAuthorInitial(post: any): string {
    const name = this.getAuthorName(post).trim();
    return name ? name[0].toUpperCase() : 'A';
  }

  getPostDate(post: any): any {
    return post?.created_at ?? post?.createdAt ?? null;
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any[]>(`${environment.apiUrl}/post`).subscribe({
      next: (data) => {
        console.log('Posts loaded:', data);
        this.posts = data || [];
        this.isLoading = false;
        // Prevent ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load posts error:', error);
        this.errorMessage = error?.error?.message || 'Failed to load posts.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  reactToPost(post: any): void {
    const postId = this.getPostId(post);
    if (!postId) {
      this.alertService.error('Post id is missing.');
      return;
    }

    const { userId } = this.resolveUserContext();
    if (!userId) {
      this.alertService.error('User information is missing');
      return;
    }

    const key = this.getPostKey(post);
    this.reactingMap[key] = true;

    const payload = { reaction_type: 'heart' };

    this.http.post(`${environment.apiUrl}/post/${postId}/react`, payload).subscribe({
      next: (updated: any) => {
        const heartCount = updated?.heart_count ?? updated?.reactions?.heart;
        if (heartCount !== undefined) {
          post.heart_count = heartCount;
        } else if (post.heart_count !== undefined) {
          post.heart_count = Number(post.heart_count) + 1;
        }

        if (updated?.reactions) {
          post.reactions = updated.reactions;
        }

        this.reactingMap[key] = false;
      },
      error: (error) => {
        console.error('React error:', error);
        const friendly = error?.error?.message || 'Failed to react to post.';
        this.alertService.error(friendly);
        this.reactingMap[key] = false;
      }
    });
  }

  submitComment(post: any): void {
    const postId = this.getPostId(post);
    if (!postId) {
      this.alertService.error('Post id is missing.');
      return;
    }

    const key = this.getPostKey(post);
    const content = (this.commentInputs[key] || '').trim();
    if (!content) {
      this.alertService.error('Comment cannot be empty');
      return;
    }

    const { userId } = this.resolveUserContext();
    if (!userId) {
      this.alertService.error('User information is missing');
      return;
    }

    const payload = { content };

    this.commentSubmittingMap[key] = true;

    this.http.post(`${environment.apiUrl}/post/${postId}/comments`, payload).subscribe({
      next: () => {
        this.alertService.success('Comment posted');
        this.commentInputs[key] = '';
        this.commentSubmittingMap[key] = false;
        this.loadPosts();
      },
      error: (error) => {
        console.error('Comment error:', error);
        const friendly = error?.error?.message || 'Failed to post comment.';
        this.alertService.error(friendly);
        this.commentSubmittingMap[key] = false;
      }
    });
  }

  private getUserFromStorageFallback(): any {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.error('Failed to parse stored user', err);
      return null;
    }
  }

  private resolveUserContext() {
    const currentUser = this.authService.getCurrentUser() ?? this.getUserFromStorageFallback();
    const userId = currentUser?.user_id ?? (currentUser as any)?.id ?? (currentUser as any)?.userId;
    const campusIdRaw = (currentUser as any)?.campus_id ?? (currentUser as any)?.campusId;
    const campusId = campusIdRaw !== undefined && campusIdRaw !== null ? Number(campusIdRaw) : undefined;
    return { currentUser, userId, campusId, campusIdRaw };
  }

  private getPostId(post: any): any {
    return post?.id ?? post?.post_id ?? post?.postId ?? post?.postID;
  }

  getPostKey(post: any): string {
    const key = this.getPostId(post);
    return key !== undefined && key !== null ? String(key) : String(post?.created_at ?? post);
  }

  isReacting(post: any): boolean {
    return !!this.reactingMap[this.getPostKey(post)];
  }

  isCommentSubmitting(post: any): boolean {
    return !!this.commentSubmittingMap[this.getPostKey(post)];
  }

  hasUserReacted(post: any): boolean {
    const { userId } = this.resolveUserContext();
    if (!userId || !post?.reactions) {
      return false;
    }

    const userReaction = post.reactions.find(
      (reaction: any) => (reaction?.user_id === userId || reaction?.user?.user_id === userId) && reaction?.is_active
    );
    return !!userReaction;
  }
}
