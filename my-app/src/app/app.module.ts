import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { TwilightImperiumComponent } from './games/twilight-imperium/twilight-imperium.component';
import { NavigationComponent } from './shared/navigation/navigation.component';
​
@NgModule({
  declarations: [
    AppComponent,
    TwilightImperiumComponent,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
