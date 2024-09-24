import { Component, Inject, OnDestroy, OnInit, ChangeDetectorRef, ViewChild, ElementRef} from '@angular/core';
import { DadosService } from '../dados.service';
import { Router } from '@angular/router';
import { SharedDataService } from '../shared-data.service';
import { LoginService } from '../login.service';
import { MqttService, IMqttMessage} from 'ngx-mqtt';
import { Subscription } from 'rxjs';
import { IClientSubscribeOptions } from 'mqtt-browser';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css']
})
export class ListaComponent implements OnInit, OnDestroy{
  private subscription: Subscription | null = null;
  topicname: string = 'carro/cam_vec_1';
  msg: any;
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true }) msglog!: ElementRef;

  mensagensRecebidas: any[] = [];
  // mensagemEnvio: any = '';
  dados: any[] = [];
  dadosFormulario: any[] = [];  // variavel para armazenar os dados do banco de dados
  dadoSelecionado?: any;  // variavel para armazenar o dado selecionado
  placaPesquisada: string = ''; // variavel para pesquisar a placa
  etiquetaPesquisada: string = '';  // variavel para pesquisar a etiqueta
  nomePesquisado: string = ''; // variavel para pesquisar o nome
  dadosCopia: any[] = []; // copia dos dados do banco de dados
  carregando = true;  // variavel para mostrar o loading
  tipo_pesquisa = 1; // 1 = placa, 2 = etiqueta e 3 = nome;
  admin = false; // variavel para verificar se o usuário é admin ou não
  constructor(
              private dadosService: DadosService, private router: Router, private sharedDataService: SharedDataService, 
              private loginService: LoginService, private detect: ChangeDetectorRef, private _mqttService: MqttService
             ){
            }


  ngOnInit(): void {

    this.admin = this.loginService.isUserAdmin();
    this.onListar();
    this.sharedDataService.codigoEtiqueta$.subscribe((codigoEtiqueta) => {  // recebe o codigo da etiqueta do componente analise
      if (codigoEtiqueta) {
        this.tipo_pesquisa = 2;
        this.etiquetaPesquisada = codigoEtiqueta;
        setTimeout(() => {
          this.filtrarEtiquetas();
        }, 500);
      }
    });
    this.sharedDataService.setCodigoEtiqueta('');
  }
  //-------------------------------------
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  subscribeNewTopic(): void {
    console.log('inside subscribe new topic')
    this.subscription = this._mqttService.observe(this.topicname).subscribe((message: IMqttMessage) => {
      this.msg = message;
      console.log('msg: ', message)
      this.logMsg('Message: ' + message.payload.toString() + '<br> for topic: ' + message.topic);
    });
    this.logMsg('subscribed to topic: ' + this.topicname)
  }

  sendmsg(): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(this.topicname, this.msg, { qos: 1, retain: true })
    this.msg = ''
  }
  
  logMsg(message: string): void {
    this.msglog.nativeElement.innerHTML += '<br><hr>' + message;
  }

  clear(): void {
    this.msglog.nativeElement.innerHTML = '';
  }

  //-------------------------------------
  formatarData(data: string): string {  // formata a data para o formato dd/mm/aaaa
    const dataFormatada = new Date(data);
    return dataFormatada.toLocaleDateString('pt-BR');
  }

  formatarCNH(cnh: number): string {  // formata a CNH para Sim ou Não
    let cnhformatada;
    if (cnh == 1) {
      cnhformatada = 'Sim';
    } else {
      cnhformatada = 'Não';
    }
    return cnhformatada;
  }

  onListar(): void {  // lista os dados do banco de dados
    this.dadosService.getDados().subscribe({
      next: (resultado: any) => { (this.dadosFormulario = resultado.map((item: any) => {
        return {...item, validadeEtiqueta: this.formatarData(item.validadeEtiqueta), CNHvalida: this.formatarCNH(item.CNHvalida) };
      }))},
      error: (erro: any) => console.log(erro),
      complete: () => console.log('completo')
    });
    this.dadosService.getDados().subscribe({
      next: (resultado: any) => { (this.dadosCopia = resultado.map((item: any) => {
        return {...item, validadeEtiqueta: this.formatarData(item.validadeEtiqueta), CNHvalida: this.formatarCNH(item.CNHvalida) };
      }))},
      error: (erro: any) => console.log(erro),
      complete: () => this.carregando = false
    });
    
    //transferido do component mqtt
    this.dadosService.getUltimaMensagem().subscribe({
      next: (resultado: any[]) => {
        console.log(resultado);
        (this.mensagensRecebidas = resultado.map((item: any) => {
          return {...item, img: `../assets/images/entrada/${item.img}`, dataHora: this.formatarData(item.dataHora)}}));
          this.detect.detectChanges();
      },
      error: (error: any) => { console.log(error) },
    }); 
    

    /** 
    this.dadosService.getUltimaMensagem().pipe(
      map((resultado: any[]) =>{
         console.log(resultado);

         return resultado.map((item: any)=>{
            return {
              ...item, 
              img: `../assets/images/entrada/${item.img}`,
              dataHora: this.formatarData(item.dataHora)
            }
         })
      }) 
    )*/
  }

  deletarDados(placa: any): void {  // deleta os dados do banco de dados
    this.dadosService.deletarDados(placa).subscribe({});
    this.carregando = true;
    setTimeout(() => {
      this.onListar();
    }, 1000);
    
  }

  editarDados(Placa: any): void { // navega para o componente editar
    this.router.navigate([`/editar/${Placa}`]);
  }

  filtrarPlacas(): void { // filtra as placas
    if (this.placaPesquisada) {
      this.placaPesquisada = this.placaPesquisada.toUpperCase();

      this.dadosFormulario = this.dadosCopia.filter((dados) => {
        return dados.Placa.toUpperCase().includes(this.placaPesquisada);
      });
    } else {
      this.dadosFormulario = [...this.dadosCopia];
    }
  }

  filtrarEtiquetas(): void {  // filtra as etiquetas
    if (this.etiquetaPesquisada) {

      this.dadosFormulario = this.dadosCopia.filter((dados) => {
        return dados.codigoEtiqueta.includes(this.etiquetaPesquisada);
      });
    } else {
      this.dadosFormulario = [...this.dadosCopia];
    }
  }

  filtrarNome(): void { // filtra os nomes
    if (this.nomePesquisado) {
      let p = this.nomePesquisado.toUpperCase();

      this.dadosFormulario = this.dadosCopia.filter((dados) => {
        return dados.Aluno.toUpperCase().includes(p);
      });
    } else {
      this.dadosFormulario = [...this.dadosCopia];
    }
  }

  trocarPesquisa(): void {  // troca o tipo de pesquisa
    if (this.tipo_pesquisa == 1) {
      this.tipo_pesquisa = this.tipo_pesquisa + 1;
      this.placaPesquisada = '';
      this.nomePesquisado = '';
      this.etiquetaPesquisada = '';
      this.filtrarPlacas();
    } else if (this.tipo_pesquisa == 2) {
      this.tipo_pesquisa = this.tipo_pesquisa + 1;
      this.placaPesquisada = '';
      this.nomePesquisado = '';
      this.etiquetaPesquisada = '';
      this.filtrarEtiquetas();
    } else {
      this.tipo_pesquisa = 1;
      this.placaPesquisada = '';
      this.nomePesquisado = '';
      this.etiquetaPesquisada = '';
      this.filtrarNome();
    }
  }
}

