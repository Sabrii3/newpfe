import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {
  async getResponse(message: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => resolve('This is a bot response!'), 1000);
    });
  }
}