import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import {MatToolbarModule} from '@angular/material/toolbar';
import { AppComponent } from "./app.component";
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table';
import {MatListModule} from '@angular/material/list';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectionList, MatListOption} from '@angular/material/list';
import {CommonModule} from '@angular/common';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';









@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, MatMenuModule, BrowserAnimationsModule, MatTableModule,
     MatListModule, CommonModule, MatTreeModule, MatIconModule, MatButtonModule, MatExpansionModule,
     MatCheckboxModule, MatInputModule, MatFormFieldModule, FormsModule],
  exports: [MatSelectionList, MatListOption],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}


