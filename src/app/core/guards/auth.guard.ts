import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AuthService } from "../services";
// import { AuthService } from "@core/services";

@Injectable()
export class AuthGuard implements CanActivate {


    constructor(
        private router: Router,
        private authService: AuthService
    ) { }

    canActivate(): boolean {
        const token = this.authService.getToken();
        console.log(token)
        if (!token) {
            this.router.navigate(['/signin']);
            return false;
        }

        return true;
    }

}