import { Component } from "@angular/core";
import * as signalR from "@aspnet/signalr";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { map, switchMap } from "rxjs/operators";

interface SignalRConnection {
  url: string;
  accessToken: string;
}

interface Counter {
  id: number;
  count: number;
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent {
  private readonly httpOptions = { headers: new HttpHeaders({ "Content-Type": "application/json" }) };
  private readonly negotiateUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/negotiate";
  private readonly getCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/get-counter";
  private readonly updateCounterUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/update-counter";
  private readonly getIotDevicesUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/devices";
  private readonly pushButtonUrl = "https://cors-anywhere.herokuapp.com/https://counterfunctions20200425175523.azurewebsites.net/api/pushButton";

  private readonly counterId = 1;

  private hubConnection: signalR.HubConnection;
  public counter: number = 0;
  public devices: string[] = [];

  constructor(private readonly http: HttpClient) {
    const negotiateBody = { UserId: "SomeUser" };

    this.http
      .post<SignalRConnection>(this.negotiateUrl, JSON.stringify(negotiateBody), this.httpOptions)
      .pipe(
        map(connectionDetails =>
          new signalR.HubConnectionBuilder().withUrl(`${connectionDetails.url}`, { accessTokenFactory: () => connectionDetails.accessToken }).build()
        )
      )
      .subscribe(hub => {
        this.hubConnection = hub;
        hub.on("CounterUpdate", data => {
          console.log(data);
          this.counter = data.Count;
        });
        hub.start();
      });

    this.http.get<Counter>(this.getCounterUrl + "/" + this.counterId).subscribe(cloudCounter => {
      console.log(cloudCounter);
      this.counter = cloudCounter.count;
    });

    this.http.get<string[]>(this.getIotDevicesUrl).subscribe(devices => {
      console.log(devices);
      this.devices = devices;
    });
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
}
