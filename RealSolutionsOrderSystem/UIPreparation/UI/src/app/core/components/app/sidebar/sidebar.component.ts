import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../admin/login/services/auth.service';
import { CustomerComponent } from 'app/core/components/customer/customer.component';
import { ColorComponent } from 'app/core/components/color/color.component';
import { ProductComponent } from 'app/core/components/product/product.component';
import { WarehouseComponent } from 'app/core/components/warehouse/warehouse.component';
import { OrderComponent } from 'app/core/components/order/order.component';


declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    claim:string;
}
export const ADMINROUTES: RouteInfo[] = [
  { path: '/user', title: 'Users', icon: 'how_to_reg', class: '', claim:"GetUsersQuery" },
  { path: '/group', title: 'Groups', icon:'groups', class: '',claim:"GetGroupsQuery" },
  { path: '/operationclaim', title: 'OperationClaim', icon:'local_police', class: '', claim:"GetOperationClaimsQuery"},
  { path: '/language', title: 'Languages', icon:'language', class: '', claim:"GetLanguagesQuery" },
  { path: '/translate', title: 'TranslateWords', icon: 'translate', class: '', claim: "GetTranslatesQuery" },
    { path: '/log', title: 'Logs', icon: 'update', class: '', claim: "GetLogDtoQuery" },
    { path: '/customer', title: 'Müþteri Tanýmlama', icon: 'person', class: '', claim: 'GetCustomersQuery' },
    { path: '/product', title: 'Ürün Tanýmlama', icon: 'shopping_basket', class: '', claim: 'GetProductsQuery' },
    { path: '/order', title: 'Sipariþ Tanýmlama', icon: 'add_shopping_cart', class: '', claim: 'CreateOrderCommand' },
    { path: '/warehouse', title: 'Depo Rapor Ekraný', icon: 'store', class: '', claim: 'GetWarehousesQuery' },
    { path: '/order', title: 'Sipariþ Rapor Ekraný', icon: 'assignment', class: '', claim: 'GetOrdersQuery' }

];

export const USERROUTES: RouteInfo[] = [ 
  //{ path: '/log', title: 'Logs', icon: 'update', class: '', claim: "GetLogDtoQuery" }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  adminMenuItems: any[];
  userMenuItems: any[];

  constructor(private router:Router, private authService:AuthService,public translateService:TranslateService) {
    
  }

  ngOnInit() {
  
    this.adminMenuItems = ADMINROUTES.filter(menuItem => menuItem);
    this.userMenuItems = USERROUTES.filter(menuItem => menuItem);

    var lang=localStorage.getItem('lang') || 'tr-TR'
    this.translateService.use(lang);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };

  checkClaim(claim:string):boolean{
    return this.authService.claimGuard(claim)
  }
  ngOnDestroy() {
    if (!this.authService.loggedIn()) {
      this.authService.logOut();
      this.router.navigateByUrl("/login");
    }
  } 
 }

