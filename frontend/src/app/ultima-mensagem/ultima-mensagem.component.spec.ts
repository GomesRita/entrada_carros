import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UltimaMensagemComponent } from './ultima-mensagem.component';

describe('UltimaMensagemComponent', () => {
  let component: UltimaMensagemComponent;
  let fixture: ComponentFixture<UltimaMensagemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UltimaMensagemComponent]
    });
    fixture = TestBed.createComponent(UltimaMensagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
