import { Component, OnInit, ViewChild,Output, EventEmitter} from '@angular/core';
//Servicios
import { EmpleadosServiceService } from "../../empleado/services/empleados-service.service";
//Modelos
import { cliente } from "../../empleado/modelos/cliente-modelo";
import { EmpleadosModelo } from "../../empleado/modelos/empleados-modelo";
import { BiometricoModelo } from "../../empleado/modelos/biometrico-modelo";
import { FormBuilder, NgForm } from "@angular/forms";
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CamaraComponent } from "../../components/camara/camara.component";
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { ActivatedRoute } from "@angular/router";

import {Subject} from 'rxjs/internal/Subject';
import {Observable} from 'rxjs/internal/Observable';
@Component({
  selector: 'app-empleadocomponent',
  templateUrl: './empleadocomponent.component.html',
  styleUrls: ['./empleadocomponent.component.css']
})

export class EmpleadocomponentComponent{  
  N_mero_de_Identificaci_n : string
  public formParent: FormGroup = new FormGroup({}); //Creamos el formulario padre y lo inicializamos
  ngForm : NgForm
  public results:string[]=[];
  public Cliente:cliente ={display_value:"",ID:""}
  public empleados: EmpleadosModelo = {  Nombre_compleo:"",Celular:"",N_mero_de_contrato:"",Contrato_Activo:"",ID:"",N_mero_de_Identificaci_n:"", Correo_electronico:"", CLIENTE1:this.Cliente,Empresa_usuaria:""};
  //Biometrico
  public BiometricoModelo: BiometricoModelo = {  Nombre:"",Empresa:"",N_mero_de_Identificaci_n:"",IDempelado:"",Fecha_ingreso:"", Fecha_salida:"",Hora_salida:"",Hora_ingreso:"",ID:""};
  public newBiometricoModelo: BiometricoModelo = {  Nombre:"",Empresa:"",N_mero_de_Identificaci_n:"",IDempelado:"",Fecha_ingreso:"", Fecha_salida:"",Hora_salida:"",Hora_ingreso:"",ID:""};
  
  
  tituloo: string = '';
  parrafo: string = '';
  titulo !:string|null;
  public triger;
  constructor(public empleadosServiceService: EmpleadosServiceService, private route:ActivatedRoute, private formBuilder: FormBuilder) { 
  }
  public pictureTaken = new EventEmitter<WebcamImage>();

  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

  // latest snapshot
  public webcamImage: WebcamImage = null;

  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
  }
  ngOnInit() {
    // this.initFormParent();
    this.N_mero_de_Identificaci_n =""
    this.titulo  = this.route.snapshot.paramMap.get('titulo')
    WebcamUtil.getAvailableVideoInputs()
    .then((mediaDevices: MediaDeviceInfo[]) => {
      this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
    });
  }
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean|string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean|string> {
    return this.nextWebcam.asObservable();
  }
  //Validar empleado
  ValidarEmpleado(Num_Identifiacion:string, Estado:string){
    this.empleadosServiceService.getEmpleado(Num_Identifiacion).subscribe(
      (res) =>{
        console.log(res)
        if (res.N_mero_de_Identificaci_n != null) {
          this.ValidarBiometrico(Num_Identifiacion, Estado,res)
        }
        else{
          console.log("NO existe") //NOTIFICACIONES
        }
      }
    ); 
  }
  ValidarBiometrico(Num_Identifiacion:string, Estado:string,Empleado_:EmpleadosModelo){
    this.empleadosServiceService.getRegistroBiometrico(Num_Identifiacion,Estado,"1").subscribe(
      (res) =>{
        console.log(res)
        if (Estado == "Ingreso") {
          if (res.N_mero_de_Identificaci_n != null) {
            console.log("EXISTE")//NOTIFICACIONES
            
          }
          else{
            console.log("NO existe")//NOTIFICACIONES
            
            this.newBiometricoModelo.Nombre=Empleado_.Nombre_compleo
            this.newBiometricoModelo.Empresa=Empleado_.Empresa_usuaria
            this.newBiometricoModelo.N_mero_de_Identificaci_n=Empleado_.N_mero_de_Identificaci_n
            this.newBiometricoModelo.IDempelado=Empleado_.ID
            this.addEmpleado(this.newBiometricoModelo,Estado)
            this.getEmpleado(Num_Identifiacion)
          }
        }//SALIDA
        else{
          console.log("SALIDA")
          //SI existe entonces ya hizo registro de salida
          if (res.N_mero_de_Identificaci_n != null) {
            //SE DEBE COLCOAR UNA ALERTA
            console.log("ALERTA Existe un registro de salida ya") //NOTIFICACIONES
          }
          else{

            //Validar de nuevo
            this.empleadosServiceService.getRegistroBiometrico(Num_Identifiacion,Estado,"2").subscribe(
              (res) =>{
                      if (res.N_mero_de_Identificaci_n != null) {
                        this.newBiometricoModelo.Nombre=Empleado_.Nombre_compleo
                        this.newBiometricoModelo.Empresa=Empleado_.Empresa_usuaria
                        this.newBiometricoModelo.N_mero_de_Identificaci_n=Empleado_.N_mero_de_Identificaci_n
                        this.newBiometricoModelo.IDempelado=Empleado_.ID
                        this.newBiometricoModelo.ID=res.ID
                        //Actualizar
                        this.updateBiometrico(this.newBiometricoModelo,res.ID)
                        this.getEmpleado(Num_Identifiacion)
                      }
                      else{
                        this.newBiometricoModelo.Nombre=Empleado_.Nombre_compleo
                        this.newBiometricoModelo.Empresa=Empleado_.Empresa_usuaria
                        this.newBiometricoModelo.N_mero_de_Identificaci_n=Empleado_.N_mero_de_Identificaci_n
                        this.newBiometricoModelo.IDempelado=Empleado_.ID
                        this.newBiometricoModelo.ID=res.ID
                        this.addEmpleado(this.newBiometricoModelo,Estado)
                        this.getEmpleado(Num_Identifiacion)
                      }
              }
            )
          }
        }
        
      }
    );
  }
  //Obtener empleado
  getEmpleado(id:string){
    this.empleadosServiceService.getEmpleado(id).subscribe(empleados => (this.empleados = empleados));
  }
  addEmpleado(newBiometrico:BiometricoModelo,Estado:string){
    this.empleadosServiceService.createEmpleado(newBiometrico,Estado).subscribe(
      
      (res) => {
        this.triggerSnapshot()
        console.log("Ingreso")
        var data = this.webcamImage.imageAsBase64;
        this.uploadPhoto(res.ID,"")
      }
  )
  }
  uploadPhoto(ID:string,data:string){
    this.empleadosServiceService.uploadFile(ID,data)
  }
  updateBiometrico(newBiometrico:BiometricoModelo,ID:string){
    this.empleadosServiceService.updateEmpleado(ID,newBiometrico).subscribe(
      (res) => {
        console.log(res)
        //NOTIFICACIONES
      }
  )
  }
  //Funciones que reciben del input de numero de identifiacion luego de leer el qr
  values = '';
  timeout: any;
  ingreso(event: any){
    if(this.timeout != null){
      clearTimeout(this.timeout);
     }
    this.timeout = setTimeout(() => {
      const Entrada_ = event.target.value;
      var regex1 = /\_+(\d+)+[^\/]*\//g;
      if (Entrada_ != null && Entrada_.length > 5 ) {
        const text_ = Entrada_.match(regex1);
        if (text_ != null) {
          let Numeros_ = text_[0]
          let Numeros1_ = Numeros_.replace("_","").replace("/","")
          console.log(Numeros1_)
        // const Numeros_ = text_.match(regex);
        this.ValidarEmpleado(Numeros1_,"Ingreso");
        event.target.value = Numeros1_;
        this.regresar_inicio();
        // this.empleadosServiceService.selectedEmpleado.N_mero_de_Identificaci_n = Numeros1_;
        }
        else
        {
          event.target.value = "";
        }
      }
    },1500); 
  }
  salida(event: any){
    if(this.timeout != null){
      clearTimeout(this.timeout);
     }
    this.timeout = setTimeout(() => {
      const Entrada_ = event.target.value;
        var regex1 = /\_+(\d+)+[^\/]*\//g;
        if (Entrada_ != null && Entrada_.length > 5 ) {
          const text_ = Entrada_.match(regex1);
          if (text_ != null) {
            let Numeros_ = text_[0]
            let Numeros1_ = Numeros_.replace("_","").replace("/","")
            console.log(Numeros1_)
          // const Numeros_ = text_.match(regex);
          this.ValidarEmpleado(Numeros1_,"Salida");
          event.target.value = Numeros1_;
          this.regresar_inicio();
          // this.empleadosServiceService.selectedEmpleado.N_mero_de_Identificaci_n = Numeros1_;
          }
          else
          {
            event.target.value = "";
          }
        }
    },2500); 
  }
  //Función para regresar al inicio
  regresar_inicio(){
    if(this.timeout != null){
      clearTimeout(this.timeout);
     }
    this.timeout = setTimeout(() => {
    location.href = 'http://localhost:4200/Biometrico';
    location.reload();
    },300000); 
  }
  SetValue(_titulo:string, _texto:string){
    
    this.tituloo = _titulo
    this.parrafo = _texto


  }

  //Camara
  //  title = 'qr-reader';
  //  public cameras:MediaDeviceInfo[]=[];
  //  public myDevice!: MediaDeviceInfo;
  //  public scannerEnabled=false;
  //  camerasFoundHandler(cameras: MediaDeviceInfo[]){
  //    this.cameras=cameras;
  //    this.selectCamera(this.cameras[0].label);
  //  }
 
  //  scanSuccessHandler(event:string){
  //    console.log(event);
  //    this.results.unshift(event);
  //  }
 
  //  selectCamera(cameraLabel: string){    
  //    this.cameras.forEach(camera=>{
  //      if(camera.label.includes(cameraLabel)){
  //        this.myDevice=camera;
  //        console.log(camera.label);
  //        this.scannerEnabled=true;
  //      }
  //    })    
  //  }
}
