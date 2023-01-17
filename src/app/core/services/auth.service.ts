import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})

export class AuthService {

    public userKey: string = 'currentUser';
    public TitleName: any;
    public currentLanguage: any;
    public sidebarOpen: boolean = true;

    constructor(private datePipe: DatePipe) {
        this.currentLanguage = JSON.parse(localStorage.getItem('setLanguage'));
    }

    setCurrentUser(userData: any) {
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    SetHeaderTitleName(value?: any) {
        this.TitleName = value;
        return;
    }

    getToken(): string | null {
        let currentUser: any = localStorage.getItem(this.userKey);
        if (!currentUser) return null;

        currentUser = JSON.parse(currentUser);
        const token = currentUser['token'];

        return token;
    }


    setUserName(UserName: any) {
        localStorage.setItem(btoa("UserName"), btoa(UserName));
    }
    getUserName() {
        let un = localStorage.getItem(btoa("UserName"));
        un = un === null ? un : atob(un);
        return un;
    }

    setRoleName(RoleName: any) {
        localStorage.setItem(btoa("RoleName"), btoa(RoleName));
    }
    getRoleName() {
        let un = localStorage.getItem(btoa("RoleName"));
        un = un === null ? un : atob(un);
        return un;
    }

    getPermission() {
        let un = localStorage.getItem(btoa("Permission"));
        un = un === null ? un : atob(un);
        let ts = un ? JSON.parse(un) : []
        return ts;
    }

    /**
     * Logout the current session
     */
    logout() {
        localStorage.clear();
    }

    setSidebarState(val: boolean) {
        this.sidebarOpen = val;
    }
    getSidebarState() {
        return this.sidebarOpen
    }

}
