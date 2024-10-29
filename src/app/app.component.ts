import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatContent } from './models/chat-content';
import { LineBreakPipe } from './pipes/line-break.pipe';
import { ChatService } from './services/chat.service';
import { SpeechService } from './services/speech.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatIconModule, MarkdownComponent, LineBreakPipe, JsonPipe, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private chatService = inject(ChatService);
  private speechService = inject(SpeechService);

  title = 'Angular AI Assistant';
  contents: ChatContent[] = [];
  message = computed(() => this.speechService.message())

  isSpeakerOn = this.speechService.isSpeakerOn;
  isRecording = this.speechService.isRecording;

  toggleSpeaker() {
    this.speechService.toggleSpeaker();
  }

  startRecording() {
    this.speechService.startRecording();
  }

  stopRecording() {
    this.speechService.stopRecording();
  }

  sendMessage(): void {
    const chatContent: ChatContent = {
      agent: 'user',
      message: this.message(),
    };

    const loadingContent: ChatContent = {
      agent: 'chatbot',
      message: '...',
      loading: true,
    };

    this.contents = [...this.contents, chatContent, loadingContent];

    this.chatService.chat(chatContent).subscribe({
      next: (content) => {
        this.contents = [
          ...this.contents.filter((content) => !content.loading),
          content
        ];
        this.speechService.speech(content.message);
      }, error: () => {
        const errorContent: ChatContent = {
          agent: 'chatbot',
          message: 'Não entendi, poderia repetir por favor?'
        }
        this.contents = [
          ...this.contents.filter((content) => !content.loading),
          errorContent,
        ];
        this.speechService.speech(errorContent.message);
      }
    });

    this.speechService.clearContent();
  }
}
