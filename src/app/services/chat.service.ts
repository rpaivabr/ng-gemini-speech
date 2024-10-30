import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatContent } from '../models/chat-content';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  genAI = new GoogleGenerativeAI(localStorage.getItem('API_KEY')!);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  chatSession = this.model.startChat({ history: [] });

  chat(chatContent: ChatContent): Observable<ChatContent> {
    return from(this.chatSession.sendMessage(chatContent.message)).pipe(
      map(({ response }) => {
        const text = response.text();
        return {
          agent: 'chatbot',
          message: text,
        };
      })
    );
  }

}
