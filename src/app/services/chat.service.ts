import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiUrl } from '../../firebase-config';
import { Observable } from 'rxjs';
import { ChatResponse } from '../components/models/chatResponse';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient){}
  
  askTravelBot(prompt: string):Observable<ChatResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { prompt: prompt };
    return this.http.post<ChatResponse>(apiUrl+"ask", body, { headers: headers });
  }
  saveConversation(conversationData: any): Observable<any> {
    const formData = new FormData();
    formData.append('user_id', conversationData.user_id);
    formData.append('message', conversationData.message);
    return this.http.post(apiUrl+'api/conversations', formData);
  }

  updateConversation(userId: string, message: string): Observable<any> {
    return this.http.put(apiUrl+`api/conversations/${userId}`, { message });
  }

  getConversation(userId: string): Observable<any> {
    return this.http.get(apiUrl+`api/conversations/${userId}`);
  }
}