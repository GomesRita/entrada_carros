import { Injectable } from '@angular/core';
import { Dados } from './dados';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, switchMap, merge } from 'rxjs';
import { environment } from '../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class DadosService {
  
  constructor(private http: HttpClient, private cookieService: CookieService) { }
  apiUrl = environment.apiUrl
  authToken: any = this.cookieService.get('authToken');
  headers = new HttpHeaders()
  .set('x-access-token', this.authToken);


  getDados(): Observable<any> { // Retorna os dados do banco da tabela aluno e carro
    return this.http.get(`${this.apiUrl}/alunocarro`, {headers: this.headers})
  }

  getMatriculas(): Observable<any> { // Retorna as matriculas do banco
    return this.http.get(`${this.apiUrl}/alunocarro/matricula`, {headers: this.headers})
  }

  getDadosporPlaca(placa: any): Observable<any> { // Retorna os dados do banco da tabela aluno e carro baseado na placa
    return this.http.get(`${this.apiUrl}/placa/${placa}`, {headers: this.headers})
  }

  getHistoricoEntrada(): Observable<any> { // Retorna os dados do banco da tabela entrada
    return this.http.get(`${this.apiUrl}/entrada`, {headers: this.headers})
  }

  getUltimaMensagem(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mqtt/ult-msg`, {headers: this.headers})
  }

  addDados(dado: Dados): Observable<any> { // Adiciona os dados no banco
        if (dado.CNHvalida == true) { // Converte o valor booleano para inteiro
          dado.CNHvalida = 1;
        } else {
          dado.CNHvalida = 0;
        }
        let dataFormatada = dado.validadeEtiqueta.toISOString().slice(0, 19).replace('T', ' '); // Converte a data para o formato do banco
        let reqAluno = {noAluno: dado.aluno, matriculaAluno: dado.matriculaAluno}; // Cria o objeto para o aluno
        let reqCarro ={ // Cria o objeto para o carro
          marcaCarro: dado.marcaCarro,
          modeloCarro: dado.modeloCarro,
          anoCarro: dado.anoCarro,
          codigoEtiqueta: dado.codigoEtiqueta,
          validadeEtiqueta: dataFormatada,
          validaCnh: dado.CNHvalida,
          matriculaRel: dado.matriculaAluno,
          placaCarro: dado.placaCarro};
        let addAluno = this.http.post(`${this.apiUrl}/alunocarro/aluno`, reqAluno, {headers: this.headers}); // Faz a requisição para o aluno
        let addCarro = this.http.post(`${this.apiUrl}/alunocarro/carro`, reqCarro, {headers: this.headers}); // Faz a requisição para o carro
        return merge(addAluno, addCarro);
  }

  addCarro(dado: any): Observable<any> {
    let dataFormatada = dado.validadeEtiqueta.toISOString().slice(0, 19).replace('T', ' ');
    let req = {
      marcaCarro: dado.marcaCarro,
      modeloCarro: dado.modeloCarro,
      anoCarro: dado.anoCarro,
      codigoEtiqueta: dado.codigoEtiqueta,
      validadeEtiqueta: dataFormatada,
      validaCnh: dado.CNHvalida,
      matriculaRel: dado.matriculaRel,
      placaCarro: dado.placaCarro
    };
    return this.http.post(`${this.apiUrl}/alunocarro/carro`, req, {headers: this.headers});
  }

  addHistoricoEntrada(dados: any): Observable<any> { // Adiciona os dados de entrada de veículos no banco
    let reqHistorico = {placa: dados.placa, dataHora: dados.dataHora, img: dados.img, idCarroRel: dados.idCarroRel};
    return this.http.post(`${this.apiUrl}/entrada`, reqHistorico, {headers: this.headers});
  }

  editarDados(dado: Dados, placa: any): Observable<any> { // Edita os dados no banco
        let dataFormatada = dado.validadeEtiqueta.toISOString().slice(0, 19).replace('T', ' '); 
        if (dado.CNHvalida === true) {
          dado.CNHvalida = 1;
        } else {
          dado.CNHvalida = 0;
        }
        let reqAluno = {noAluno: dado.aluno, matriculaAluno: dado.matriculaAluno};
        let reqCarro ={
          marcaCarro: dado.marcaCarro,
          modeloCarro: dado.modeloCarro,
          anoCarro: dado.anoCarro,
          codigoEtiqueta: dado.codigoEtiqueta,
          validadeEtiqueta: dataFormatada,
          validaCnh: dado.CNHvalida,
          matriculaRel: dado.matriculaAluno,
          placaCarro: dado.placaCarro};
        let putAluno = this.http.put(`${this.apiUrl}/alunocarro/aluno/${dado.matriculaAluno}`, reqAluno, {headers: this.headers});
        let putCarro = this.http.put(`${this.apiUrl}/alunocarro/carro/${placa}`, reqCarro, {headers: this.headers});
        return merge(putAluno, putCarro) // Faz a requisição para o aluno e para o carro utilizando o merge
        
  }

  deletarDados(placa: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/placa/${placa}`, {headers: this.headers}).pipe(
      switchMap((resultado: any) => {
        let matricula = resultado[0].Matricula; // Pega a matricula do aluno
        let deleteCarro = this.http.delete(`${this.apiUrl}/alunocarro/carro/${placa}`, {headers: this.headers}); // Requisição para o carro
        let deleteAluno = this.http.delete(`${this.apiUrl}/alunocarro/aluno/${matricula}`, {headers: this.headers}); // Requisição para o aluno
        return merge(deleteCarro, deleteAluno); // Faz a requisição para o aluno e para o carro utilizando o merge
      })
    );
  }
}
