import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CustomModalComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showCloseButton = true;
  @Input() closeOnBackdrop = true;
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';
  @Input() customClass = '';

  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  constructor(private modalController: ModalController) {}

  async close(data?: any): Promise<void> {
    await this.modalController.dismiss(data);
    this.closed.emit();
  }

  async dismiss(data?: any): Promise<void> {
    await this.close(data);
  }

  getModalClasses(): string {
    let classes = 'custom-modal';

    // Size classes
    switch (this.size) {
      case 'small':
        classes += ' modal-small';
        break;
      case 'large':
        classes += ' modal-large';
        break;
      case 'fullscreen':
        classes += ' modal-fullscreen';
        break;
      default:
        classes += ' modal-medium';
    }

    // Custom classes
    if (this.customClass) {
      classes += ` ${this.customClass}`;
    }

    return classes;
  }

  hasFooterContent(): boolean {
    // This method checks if there's content in the modal-footer slot
    // For now, we'll return true if the component has projected content
    // In a real implementation, you might want to use a more sophisticated approach
    return true; // You can modify this based on your needs
  }
}