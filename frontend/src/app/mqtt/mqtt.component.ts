import { Component, OnDestroy, OnInit } from '@angular/core';
import { DadosService } from '../dados.service';

@Component({
  selector: 'app-mqtt',
  templateUrl: './mqtt.component.html',
  styleUrls: ['./mqtt.component.css']
})
export class MqttComponent implements OnInit{
  mensagensRecebidas: any[] = [];
  // mensagemEnvio: any = '';
  dados: any[] = [];
  carregando = true;  // variavel para mostrar o loading
  
  constructor(private dadosService: DadosService) {}

  ngOnInit(): void {
    this.onListar();


  }




  formatarData(data: string): string {
    const opcoes: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const dataFormatada = new Date(data);
    return dataFormatada.toLocaleString('pt-BR', opcoes);
  }

  onListar(): void {  // lista os dados do banco de dados
    this.dadosService.getHistoricoEntrada().subscribe({
      next: (resultado: any[]) => { 
        (this.dados = resultado.map((item: any) => {
          return {...item, img: `../assets/images/entrada/${item.img}`, dataHora: this.formatarData(item.dataHora)}}));
      },
      error: (error: any) => { console.log(error) },
      complete: () => this.carregando = false
    });
    //Método Transferido para o compenente lista
    
    this.dadosService.getUltimaMensagem().subscribe({
      next: (resultado: any[]) => {
        console.log(resultado);
        (this.mensagensRecebidas = resultado.map((item: any) => {
          return {...item, img: `../assets/images/entrada/${item.img}`, dataHora: this.formatarData(item.dataHora)}}));
      },
      error: (error: any) => { console.log(error) },
    }); 
    
  }

  // handleFileInput(event: any): void {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();

  //   reader.onloadend = () => {
  //     this.mensagemEnvio = reader.result;
  //   };

  //   if (file) {
  //     reader.readAsDataURL(file);
  //   }
  // }

  // isBase64Image(str: string): boolean {
  //   return str.startsWith('data:image');
  // }

  // enviarMensagem() {
  //   this.servicoMqtt.publish(this.topico, this.mensagemEnvio).subscribe({
  //     next: () => {
  //       console.log('Mensagem enviada');
  //       this.mensagemEnvio = '';
  //     },
  //     error: (err) => {
  //       console.error('Erro ao enviar mensagem', err);
  //     },
  //   });
  // }
  
}
