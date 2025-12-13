import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  // Success Alert
  success(title: string, message: string = '', confirmText: string = 'OK'): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: confirmText,
      confirmButtonColor: '#4099ff'
    });
  }

  // Error Alert
  error(title: string, message: string = '', confirmText: string = 'OK'): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: confirmText,
      confirmButtonColor: '#4099ff'
    });
  }

  // Warning Alert
  warning(title: string, message: string = '', confirmText: string = 'OK'): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: confirmText,
      confirmButtonColor: '#4099ff'
    });
  }

  // Info Alert
  info(title: string, message: string = '', confirmText: string = 'OK'): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonText: confirmText,
      confirmButtonColor: '#4099ff'
    });
  }

  // Confirmation Dialog (Yes/No)
  confirm(title: string, message: string = '', confirmText: string = 'Yes', cancelText: string = 'No'): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#4099ff',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  // Logout Confirmation (specific for logout)
  confirmLogout(): Promise<boolean> {
    return this.confirm('Logout?', 'Are you sure you want to logout?', 'Logout', 'Cancel');
  }

  // Loading Alert (Toast style)
  loading(message: string = 'Please wait...'): void {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Close Alert
  close(): void {
    Swal.close();
  }

  // Toast Alert (top-right corner)
  toast(icon: 'success' | 'error' | 'warning' | 'info', title: string, timer: number = 3000): Promise<any> {
    return Swal.fire({
      icon: icon,
      title: title,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true
    });
  }
}
