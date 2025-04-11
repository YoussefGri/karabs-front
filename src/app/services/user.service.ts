import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../environments/environment"
import { AuthService } from "./auth.service"

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = environment.apiUrl

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  updateUserProfile(userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/user/update`, userData)
  }

  updateUserAvatar(file: File): Observable<any> {
    const formData = new FormData()
    formData.append("avatar", file)

    return this.http.post(`${this.apiUrl}/api/user/avatar`, formData)
  }
}