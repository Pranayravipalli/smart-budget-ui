import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,     // 👈 For form handling
    HttpClientModule,        // 👈 For HTTP calls
    RouterModule             // 👈 For routing (required even if you have AppRoutingModule)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
