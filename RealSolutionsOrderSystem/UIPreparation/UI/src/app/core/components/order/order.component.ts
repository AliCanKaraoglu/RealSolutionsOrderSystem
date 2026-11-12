import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/order';
import { OrderService } from './services/order.service';
import { Product } from '../product/models/product';
import { ProductService } from '../product/services/product.service';
import { Customer } from '../customer/models/customer';
import { CustomerService } from '../customer/services/customer.service';

declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
	providers: [OrderService, ProductService, CustomerService]
})
export class OrderComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'customerId', 'productId', 'quantity', 'createdDate', 'update', 'delete'];

	orderList: Order[];
	order: Order = new Order();
	orderAddForm: FormGroup;
	orderId: number;

	// Seçim kutularýnda ürün ve müþteri listeleri
	productList: Product[] = [];
	customerList: Customer[] = [];

	constructor(
		private orderService: OrderService,
		private productService: ProductService,
		private customerService: CustomerService,
		private lookupService: LookUpService,
		private alertifyService: AlertifyService,
		private formBuilder: FormBuilder,
		private authService: AuthService
	) { }

	ngAfterViewInit(): void {
		this.getOrderList();
	}

	ngOnInit() {
		this.createOrderAddForm();
		this.getProductsAndCustomers();
	}

	// kutular için ürün ve müþterileri veritabanýndan çekiyoruz
	getProductsAndCustomers() {
		this.productService.getProductList().subscribe(data => {
			this.productList = data;
		});
		this.customerService.getCustomerList().subscribe(data => {
			this.customerList = data;
		});
	}

	getOrderList() {
		this.orderService.getOrderList().subscribe(data => {
			this.orderList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	save() {
		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value);

			if (this.order.id == 0)
				this.addOrder();
			else
				this.updateOrder();
		}
	}

	addOrder() {
		this.orderService.addOrder(this.order).subscribe(data => {
			this.getOrderList();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
		}, error => {
			this.alertifyService.error(error.error);
		});
	}

	updateOrder() {
		this.orderService.updateOrder(this.order).subscribe(data => {
			var index = this.orderList.findIndex(x => x.id == this.order.id);
			this.orderList[index] = this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
		}, error => {
			this.alertifyService.error(error.error);
		});
	}

	createOrderAddForm() {
		this.orderAddForm = this.formBuilder.group({
			id: [0],
			customerId: [1, Validators.required],
			productId: [1, Validators.required],
			quantity: [1, Validators.required]
		});
	}

	deleteOrder(orderId: number) {
		this.orderService.deleteOrder(orderId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.orderList = this.orderList.filter(x => x.id != orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		});
	}

	getOrderById(orderId: number) {
		this.clearFormGroup(this.orderAddForm);
		this.orderService.getOrderById(orderId).subscribe(data => {
			this.order = data;
			this.orderAddForm.patchValue(data);
		});
	}

	clearFormGroup(group: FormGroup) {
		group.markAsUntouched();
		group.reset();
		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
		});
	}

	checkClaim(claim: string): boolean {
		return this.authService.claimGuard(claim);
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}
}