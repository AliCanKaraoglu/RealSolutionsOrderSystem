import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Color } from './models/Color';
import { ColorService } from './services/Color.service';
import { environment } from 'environments/environment';

declare var jQuery: any;

@Component({
	selector: 'app-color',
	templateUrl: './color.component.html',
	styleUrls: ['./color.component.scss']
})
export class ColorComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id','createdUserId','createdDate','lastUpdatedUserId','lastUpdatedDate','status','isDeleted','name', 'update','delete'];

	colorList:Color[];
	color:Color=new Color();

	colorAddForm: FormGroup;


	colorId:number;

	constructor(private colorService:ColorService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }

    ngAfterViewInit(): void {
        this.getColorList();
    }

	ngOnInit() {

		this.createColorAddForm();
	}


	getColorList() {
		this.colorService.getColorList().subscribe(data => {
			this.colorList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}

	save(){

		if (this.colorAddForm.valid) {
			this.color = Object.assign({}, this.colorAddForm.value)

			if (this.color.id == 0)
				this.addColor();
			else
				this.updateColor();
		}

	}

	addColor(){

		this.colorService.addColor(this.color).subscribe(data => {
			this.getColorList();
			this.color = new Color();
			jQuery('#color').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.colorAddForm);

		})

	}

	updateColor(){

		this.colorService.updateColor(this.color).subscribe(data => {

			var index=this.colorList.findIndex(x=>x.id==this.color.id);
			this.colorList[index]=this.color;
			this.dataSource = new MatTableDataSource(this.colorList);
            this.configDataTable();
			this.color = new Color();
			jQuery('#color').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.colorAddForm);

		})

	}

	createColorAddForm() {
		this.colorAddForm = this.formBuilder.group({		
			id : [0],
createdUserId : [0, Validators.required],
createdDate : [null, Validators.required],
lastUpdatedUserId : [0, Validators.required],
lastUpdatedDate : [null, Validators.required],
status : [false, Validators.required],
isDeleted : [false, Validators.required],
name : ["", Validators.required]
		})
	}

	deleteColor(colorId:number){
		this.colorService.deleteColor(colorId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.colorList=this.colorList.filter(x=> x.id!=colorId);
			this.dataSource = new MatTableDataSource(this.colorList);
			this.configDataTable();
		})
	}

	getColorById(colorId:number){
		this.clearFormGroup(this.colorAddForm);
		this.colorService.getColorById(colorId).subscribe(data=>{
			this.color=data;
			this.colorAddForm.patchValue(data);
		})
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

	checkClaim(claim:string):boolean{
		return this.authService.claimGuard(claim)
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
