import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private synthesis = window.speechSynthesis;
  private speechRecognition: SpeechRecognition | null = null;
  private isSpeakerOnState = signal(true);
  private isRecordingState = signal(false);
  private messageState = signal('');

  isSpeakerOn = this.isSpeakerOnState.asReadonly();
  isRecording = this.isRecordingState.asReadonly();
  message = this.messageState.asReadonly();

  toggleSpeaker(): void {
    if (this.synthesis.speaking && this.isSpeakerOn()) {
      this.synthesis.cancel();
    }
    this.isSpeakerOnState.update(value => !value);
  }

  speech(text: string) {
    if (!this.isSpeakerOn()) return;

    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance();
    utterance.lang = "pt-BR";
    utterance.text = text
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
      .replaceAll('*', '').replaceAll('#', '');
    this.synthesis.speak(utterance);
  }

  clearContent() {
    this.stopRecording();
    this.messageState.set('');
  }

  startRecording() {
    this.isRecordingState.set(true);

    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }

    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporte a API de gravação!');
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognitionAPI();
    this.speechRecognition.lang = 'pt-BR';
    this.speechRecognition.continuous = true;
    this.speechRecognition.maxAlternatives = 1;
    this.speechRecognition.interimResults = false;
    fromEvent(this.speechRecognition, 'result').subscribe((event: Event) => {
      const { results } = <SpeechRecognitionEvent>event;

      const transcription = Array.from(results).reduce(
        (text, result) => text.concat(result[0].transcript),
        ''
      );
      this.messageState.set(transcription);
    });
    fromEvent(this.speechRecognition, 'error').subscribe(console.error);
    this.speechRecognition.start();
  }

  stopRecording() {
    this.isRecordingState.set(false);

    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

}
