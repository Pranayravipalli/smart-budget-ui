import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  viewDate = new Date();
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: CalendarDay[] = [];

  expenses: Expense[] = [];
  selectedDay: Date | null = null;
  selectedDayExpenses: Expense[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.fetchExpenses();
  }

  previousMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];

    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    // Fill previous month's days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }

    // Fill current month days
    for (let i = 1; i <= totalDays; i++) {
      this.calendarDays.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Fill next month's days to complete the grid
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
  }

  fetchExpenses(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<Expense[]>('http://localhost:7262/api/expenses', { headers })
      .subscribe({
        next: (data) => {
          this.expenses = data;
        },
        error: (err) => {
          console.error('Error fetching expenses:', err);
        }
      });
  }

  hasExpenses(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.expenses.some(exp => exp.date.startsWith(dateStr));
  }

  onDayClick(date: Date): void {
    this.selectedDay = date;
    const dateStr = date.toISOString().split('T')[0];
    this.selectedDayExpenses = this.expenses.filter(exp => exp.date.startsWith(dateStr));
  }
}
