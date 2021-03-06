import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

interface resetData {
  token: any;
  email: any;
  userId: any;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})


export class ResetPasswordComponent implements OnInit {

  public token: any;
  public email: any;
  public userId: any;

  constructor(public activateroute: ActivatedRoute,
    public fb: FormBuilder,
    public http: HttpClient,
    private title:Title) {
    this.title.setTitle('Reset Password | Dynamic Prescriptive Maintenence');
    this.token = this.activateroute.snapshot.queryParamMap.get('token');
    this.email = this.activateroute.snapshot.queryParamMap.get('email');
    this.userId = this.activateroute.snapshot.queryParamMap.get('userId');
  }


  ngOnInit() {

  }


  formModel = this.fb.group({
    Passwords: this.fb.group({
      Password: ['', [Validators.required, Validators.minLength(8)]],
      ConfirmPassword: ['', Validators.required]
    }, { validator: this.comparePasswords })

  });


  comparePasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get('ConfirmPassword');
    if (confirmPswrdCtrl.errors == null || 'passwordMismatch' in confirmPswrdCtrl.errors) {
      if (fb.get('Password').value != confirmPswrdCtrl.value)
        confirmPswrdCtrl.setErrors({ passwordMismatch: true });
      else
        confirmPswrdCtrl.setErrors(null);
    }
  }

  ResetPassword() {
    let data = {
      Email: this.email,
      Token: this.token,
      userId: this.userId,
      Password: this.formModel.value.Passwords.Password
    }

    this.http.post('api/ForgotPasswordAPI/Reset', data).subscribe(
      res => {
        console.log(res)
      },
      err => {
        console.log(err)
      }
    )

  }

}
