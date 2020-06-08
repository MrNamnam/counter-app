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
/*
interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  symbol1: string;
  symbol2: string;
  symbol3: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H', symbol1:'1',symbol3:'3' ,symbol2:'2'},
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F', symbol1: '1', symbol3: '3', symbol2: '2'},
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne', symbol1: '1', symbol3: '3', symbol2: '2'},
];*/


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
  private readonly getActiveEvents = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/CurrentAlerts?sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-08-08T06:17:45Z&st=2020-06-02T22:17:45Z&spr=https&sig=ez4xdZR94dP9%2FB8Czup%2FRXLYaa%2BfWilA%2BOfi9rgCZqU%3D"
  private readonly getClientData = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/ClientsTable()"
  private readonly addEvent = "http://localhost:7071/api/add-event"
  private readonly deleteCurrent = "http://localhost:7071/api/delete-alert"
  //?$filter=RowKey%20eq%20"

  // lina:
  private readonly getHistoryEvents = "https://cors-anywhere.herokuapp.com/https://smokingdetectors.table.core.windows.net/DetectorsEvents?sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-08-08T06:17:45Z&st=2020-06-02T22:17:45Z&spr=https&sig=ez4xdZR94dP9%2FB8Czup%2FRXLYaa%2BfWilA%2BOfi9rgCZqU%3D"

  private readonly connectionStringStorage = "?sv=2019-10-10&ss=t&srt=sco&sp=rwdlacu&se=2020-08-08T06:17:45Z&st=2020-06-02T22:17:45Z&spr=https&sig=ez4xdZR94dP9%2FB8Czup%2FRXLYaa%2BfWilA%2BOfi9rgCZqU%3D"
  private readonly counterId = 1;

  private hubConnection: signalR.HubConnection;
  public counter: number = 0;
  public devices: string[] = ["bla", "bla1"];
  public events: JSON;
  public page: string;

  // lina:
  public displayedColumns: string[] = ['id', 'city', 'country', 'lat', 'lon','details','bool','number'];
  public dataSource: object[] = [];
  //lonlat
  private readonly getLonLat = "https://nominatim.openstreetmap.org/lookup?osm_ids=R146006,W100093803,N240109189&format=json";
  public lonlatArr: string[];

  public ALERTS_DATA:  AlertNode[] = [];
  public errorSubmit: string;
  public details: string = null
  public injured: number = null;
  public url: string;

  constructor(private readonly http: HttpClient) {
    const negotiateBody = { UserId: "SomeUser" };

    //lonlat
    this.http.get<JSON>(this.getLonLat, this.httpOptions).subscribe(lonlat => {
      console.log(lonlat)
      this.lonlatArr = lonlat["0"]["address"];
     //  this.CreateHistoryAlerts(lonlat["0"])
        console.log(this.lonlatArr)
    });

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
      console.log(Alerts)
      for (let key in Alerts["value"]) {
        let query = "$filter=PartitionKey%20eq%20'sample@sample.com'"
        this.http.get<JSON>(this.getClientData + this.connectionStringStorage , this.httpOptions).subscribe(clientsData => {
          console.log(Alerts["value"][key])
          this.CreateAlerts(Alerts["value"][key], clientsData["value"]["0"])
        });
      }
      console.log(this.ALERTS_DATA)
    }); 

    this.http.get<JSON>(this.getHistoryEvents, this.httpOptions).subscribe(History => {
      for (let key in History["value"]) {
        console.log(History)
        this.CreateHistoryAlerts(History["value"][key])
      }
    });
          
  }

  public CreateAlerts(alertElement, clientElement): void {
    console.log(alertElement)
    console.log(clientElement)
    this.ALERTS_DATA.push({alert_obj: alertElement, client_obj: clientElement})     
  }

  public CreateHistoryAlerts(event): void{
    console.log(event)
    this.dataSource.push(event)
  }
  

  public changeToPage(pageName: string): void {
    this.page = pageName
  }

  changeDisabled(): boolean{
    console.log(this.checked)
    this.checked = !this.checked;
    if(this.checked){
      this.details = null
      this.injured = null
    }
    console.log(this.checked)
    return this.checked;
  }


  submitEvent(RowKey: string, PartitionKey: string, latitude: string, longitude: string, time: string,
    is_false_alarm: boolean, event_details: string, num_of_injured: number): void{
      console.log(PartitionKey)
      let is_false_alarm_str = is_false_alarm.toString();
      if(!this.checked){
        this.url =  "/" + RowKey + "/" + PartitionKey + "/" + latitude +
        "/" + longitude + "/" + time + "/" + is_false_alarm_str + "/" + "null" + "/" 
        + "null" + "/" + "adress";
      }
      else{
              this.url =  "/" + RowKey + "/" + PartitionKey + "/" + latitude +
      "/" + longitude + "/" + time + "/" + is_false_alarm_str + "/" + event_details + "/" 
      + num_of_injured + "/" + "adress";
      }


      console.log(this.url)

      this.http.post(this.addEvent + this.url, this.httpOptions).toPromise()
      .catch(e =>
        this.errorSubmit = stringify(e));

      this.http.get<JSON>(this.deleteCurrent + "/" + RowKey + "/" + PartitionKey
      , this.httpOptions) .subscribe(() => {
          console.log("delete alert");});

    location.reload();

    }




}

