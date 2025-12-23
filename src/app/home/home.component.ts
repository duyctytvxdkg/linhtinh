import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <--- PHẢI CÓ DÒNG NÀY

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // <--- PHẢI CÓ TRONG MẢNG IMPORTS
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { }
