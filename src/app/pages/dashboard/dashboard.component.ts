import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  expenseForm!: FormGroup;
  message = '';
  expenses: any[] = [];

  showExpenses = true;
  showHistory = false;
  showAnalytics = false;
  showTopCategory = false;
  showYearlyAnalytics = false;

  topCategory: any = null;
  topCategoryYearly: any = null;

  pieLabels: string[] = [];
  pieData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  pieChartType: ChartType = 'pie';

  yearlyPieLabels: string[] = [];
  yearlyPieData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  yearlyPieChartType: ChartType = 'pie';

  selectedYear: number = new Date().getFullYear();

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.expenseForm = this.fb.group({
      title: [''],
      amount: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      isRecurring: [false],
      recurringDay: [1]
    });

    this.loadExpenses();
    this.loadMonthlySummary();
    this.loadTopCategory();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadExpenses(): void {
    this.http.get<any[]>('http://localhost:7262/api/expenses', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => this.expenses = data,
        error: (err) => console.error('Failed to load expenses', err)
      });
  }

  loadMonthlySummary(): void {
    this.http.get<any[]>('http://localhost:7262/api/summary/category-pie-chart', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (summary) => {
          this.pieLabels = summary.map(item => item.category);
          const values = summary.map(item => item.totalAmount);
          this.pieData = {
            labels: this.pieLabels,
            datasets: [{ data: values }]
          };
        },
        error: (err) => console.error('Failed to load monthly summary', err)
      });
  }

  loadTopCategory(): void {
    this.http.get<any>('http://localhost:7262/api/summary/top-category', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => this.topCategory = data,
        error: (err) => console.error('Failed to load top category', err)
      });
  }

  loadYearlySummary(): void {
    this.http.post<any[]>('http://localhost:7262/api/summary/category-summary-by-year', { year: this.selectedYear }, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => {
          this.yearlyPieLabels = data.map(item => item.category);
          const values = data.map(item => item.totalAmount);
          this.yearlyPieData = {
            labels: this.yearlyPieLabels,
            datasets: [{ data: values }]
          };
        },
        error: (err) => console.error('Failed to load yearly summary', err)
      });
  }

  loadTopCategoryYearly(): void {
    this.http.post<any>('http://localhost:7262/api/summary/top-category-by-year', { year: this.selectedYear }, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => this.topCategoryYearly = data,
        error: (err) => console.error('Failed to load yearly top category', err)
      });
  }

  toggleYearlyAnalytics(): void {
    this.showYearlyAnalytics = !this.showYearlyAnalytics;
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.http.post('http://localhost:7262/api/expenses/add', this.expenseForm.value, { headers: this.getAuthHeaders() })
        .subscribe({
          next: () => {
            this.message = 'Expense added successfully!';
            this.expenseForm.reset();
            this.expenseForm.patchValue({ isRecurring: false, recurringDay: 1 });
            this.loadExpenses();
            this.loadMonthlySummary();
            this.loadTopCategory();
          },
          error: (err) => {
            this.message = err.error.message || 'Failed to add expense.';
          }
        });
    }
  }

  downloadCsv(): void {
    this.http.get('http://localhost:7262/api/expenses/export', {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'expenses.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
