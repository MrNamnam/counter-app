import { Component, ViewEncapsulation, ViewChild} from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";
import {MatSelectionList, MatListOption} from '@angular/material/list';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import { range } from 'rxjs';
import { stringify } from 'querystring';


interface SomkingDetector {
  id: number
  latitude: number
  longitude: number
  address: string
  owner_name: string
  owner_phone_num: number 
}

interface Events {
  Timestamp: Date
  device_id: number
  event_id: number
  is_false_alarm: boolean
  event_details: string
  num_of_injured: number
}

interface SignalRConnection {
  url: string;
  accessToken: string;
}

interface Counter {
  id: number;
  count: number;
}

interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];


interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Mike',
    children: [
      {name: 'home device'},
      {name: 'shop device'},
      {name: 'garage device'},
    ]
  }, {
    name: 'Charly',
    children: [
      {name: 'home device'},
      {name: 'garage device'},
    ]
  }, {
        name: 'Anne',
        children: [
          {name: 'home device'},
        ]
  },
];

/** Flat node with expandable and level information */
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface CurrentAlertsObject {
  PartitionKey: string;
  RowKey: string;
  latitude: string;
  longitude: string;
}

interface ClientsObject {
  PartitionKey: string;
  RowKey: string;
  email: string;
  name: string;
  password: string;
  phone_number: string;
}


interface AlertNode {
  alert_obj: CurrentAlertsObject;
  client_obj: ClientsObject;
}









@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  encapsulation: ViewEncapsulation.None,
})



export class AppComponent {
  panelOpenState = false;
  checked = false;

  

  private readonly httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private readonly negotiateUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/negotiate";
  private readonly getCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/get-counter";
  private readonly updateCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/update-counter";
  private readonly getIotDevicesUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/devices";
  private readonly pushButtonUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/pushButton";
  private readonly getActiveEvents = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/CurrentAlerts?sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-06-04T06:40:57Z&st=2020-05-21T22:40:57Z&spr=https&sig=V2cPiyk9d%2FKKJ0ddPQ8damTnNhHODrPPlFkCHNEiIps%3D"
  private readonly getClientData = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/ClientsTable?"
  private readonly addEvent = "http://localhost:7071/api/add-event"
  private readonly deleteCurrent = "http://localhost:7071/api/delete-alert"
  //?$filter=RowKey%20eq%20"
  private readonly connectionStringStorage = "sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-06-04T06:40:57Z&st=2020-05-21T22:40:57Z&spr=https&sig=V2cPiyk9d%2FKKJ0ddPQ8damTnNhHODrPPlFkCHNEiIps%3D"
  private readonly counterId = 1;

  private hubConnection: signalR.HubConnection;
  public counter: number = 0;
  public devices: string[] = ["bla", "bla1"];
  public events: JSON;
  public page: string;
  public displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  public dataSource: object[];
  public errorSubmit: string;
  public details: string = null
  public injured: number = null;
  public url: string;
  
  public clientsData: object
  public alerts: object
  public ALERTS_DATA:  AlertNode[];

  constructor(private readonly http: HttpClient) {
    // this.dataSourceTree.data = TREE_DATA;
    this.ALERTS_DATA = [];
    

    const negotiateBody = { UserId: "SomeUser" };

    // this.http
    //   .post<SignalRConnection>(this.negotiateUrl, JSON.stringify(negotiateBody), this.httpOptions)
    //   .pipe(
    //     map(connectionDetails =>
    //       new signalR.HubConnectionBuilder().withUrl(`${connectionDetails.url}`, { accessTokenFactory: () => connectionDetails.accessToken }).build()
    //     )
    //   )
    //   .subscribe(hub => {
    //     this.hubConnection = hub;
    //     hub.on("CounterUpdate", data => {
    //       console.log(data);
    //       this.counter = data.Count;
    //     });
    //     hub.start();
    //   });

    // this.http.get<Counter>(this.getCounterUrl + "/" + this.counterId).subscribe(cloudCounter => {
    //   console.log(cloudCounter);
    //   this.counter = cloudCounter.count;
    // });

    // this.http.get<string[]>(this.getIotDevicesUrl).subscribe(devices => {
    //   console.log(devices);
    //   this.devices = devices;
    // });

    this.http.get<JSON>(this.getActiveEvents, this.httpOptions).subscribe(Alerts => {  
      for (var key in Alerts["value"]) {
        console.log(Alerts)
        this.http.get<JSON>(this.getClientData + this.connectionStringStorage, this.httpOptions).subscribe(clientsData => {
          
          this.CreateAlerts(Alerts["value"][key], clientsData["value"]["0"])
        });
      }
      console.log(this.ALERTS_DATA)
    });

    // this.http.post(this.addEvent + "/4/1/Tel_Aviv/34353532/3435435/16:00/true/bla/6", this.httpOptions).toPromise()
    // .catch(e => console.log(e));

    // this.http.get<JSON>(this.deleteCurrent + "/2", this.httpOptions) .subscribe(() => {
    //   console.log("delete alert");
    // });;    
    
  }

  public CreateAlerts(alertElement, clientElement): void {
    console.log(alertElement)
    console.log(clientElement)
    this.ALERTS_DATA.push({alert_obj: alertElement, client_obj: clientElement})  
    this.printAlertsData(this.ALERTS_DATA["0"]["alert_obj"])    
  }

  public printAlertsData(al): void {
    console.log(al)
  }

  public increaseCounter(): void {
    const body = { Id: this.counterId, Count: this.counter++ };

    this.http
      .post(this.updateCounterUrl, body, this.httpOptions)
      .toPromise()
      .catch(e => console.log(e));
      
  }
  public pushButton(): void {
    const body = { Id: this.counterId, Count: this.counter++ };

    this.http
      .get(this.pushButtonUrl).subscribe(() => {
        console.log("called push button");
      });;      
  }

  public changeToPage(pageName: string): void {
    this.page = pageName
  }

  changeDisabled(): boolean{
    this.checked = !this.checked;
    console.log(this.checked)
    return this.checked;
  }

  addAlert(event: object, client: object): void {
    console.log(this.injured)
    console.log(event)
    console.log(client)
  }

  submitEvent(PartitionKey: string, RowKey: string, latitude: string, longitude: string, time: string,
    is_false_alarm_str: boolean, event_details: string, num_of_injured: number): void{
      console.log(PartitionKey)
      this.url = "/" + PartitionKey + "/" + RowKey + "/" + latitude +
      "/" + longitude + "/" + time + "/" + is_false_alarm_str + "/" + event_details + "/" 
      + num_of_injured;

      console.log(this.url)

      this.http.post(this.addEvent + this.url, this.httpOptions).toPromise()
      .catch(e =>
        this.errorSubmit = stringify(e));

      // this.http.get<JSON>(this.deleteCurrent + "/" + RowKey, this.httpOptions) .subscribe(() => {
      //     console.log("delete alert");});

      

    }




}

