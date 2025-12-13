// angular import
import { Component, OnInit, inject } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

// third party
import { HttpClient } from '@angular/common/http';

// project import

import { CardComponent } from 'src/app/theme/shared/components/card/card.component';
import { environment } from 'src/environments/environment';

// icons
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { HeartOutline, MessageOutline } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-sample-page',
  imports: [CommonModule, CardComponent, IconDirective],
  templateUrl: './sample-page.component.html',
  styleUrls: ['./sample-page.component.scss']
})
export class SamplePageComponent implements OnInit {
  private http = inject(HttpClient);
  private iconService = inject(IconService);
  private cdr = inject(ChangeDetectorRef);

  posts: any[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.iconService.addIcon(HeartOutline, MessageOutline);
    this.loadPosts();
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
}
