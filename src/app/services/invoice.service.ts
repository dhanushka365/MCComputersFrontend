import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvoiceDto, InvoiceResponseDto } from '../models/invoice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/api/invoices`;

  constructor(private http: HttpClient) {}

  createInvoice(invoiceData: CreateInvoiceDto): Observable<InvoiceResponseDto> {
    return this.http.post<InvoiceResponseDto>(this.apiUrl, invoiceData);
  }

  getInvoice(id: number): Observable<InvoiceResponseDto> {
    return this.http.get<InvoiceResponseDto>(`${this.apiUrl}/${id}`);
  }

  getAllInvoices(): Observable<InvoiceResponseDto[]> {
    return this.http.get<InvoiceResponseDto[]>(this.apiUrl);
  }
}
