import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { List } from "immutable";
import { PackageBuildsComponent } from "../package-builds/package-builds.component";
import { PackageLatestComponent } from "../package-latest/package-latest.component";
import { PackageReleaseComponent } from "../package-release/package-release.component";
import { PackageVersionsComponent } from "../package-versions/package-versions.component";
import { AppStore } from "../../AppStore";
import { fetchBuilds, fetchProject } from "../../actions/index";

@Component({
    template: require("./package.component.html")
})
export class PackageComponent implements OnInit, OnDestroy {
    origin: string;
    name: string;
    showSidebar: boolean = false;
    showActiveBuild: boolean = false;

    private sub: Subscription;
    private poll: number;

    constructor(private route: ActivatedRoute, private store: AppStore) {
        this.sub = this.route.params.subscribe(params => {
            this.origin = params["origin"];
            this.name = params["name"];
        });
    }

    ngOnInit() {

        // When a build is active, check on it periodically so we can
        // indicate when it completes.
        this.poll = window.setInterval(() => {
            if (this.building) {
                this.fetchBuilds();
            }
        }, 10000);
    }

    ngOnDestroy() {
        window.clearInterval(this.poll);

        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    enabled(feature) {
        return [
            "latest",
            "versions",
            "builds",
        ].indexOf(feature) >= 0;
    }

    get ident() {
        return {
            origin: this.origin,
            name: this.name
        };
    }

    get buildable(): boolean {

        let isMember = !!this.store.getState().origins.mine.find((o) => {
          return o.name === this.origin;
        });

        let hasProject = this.store.getState().projects.current.ui.exists;

        if (isMember && hasProject) {
            return true;
        }

        return false;
    }

    get activeBuilds(): List<any> {
        const activeStates = ["Dispatched", "Pending", "Processing"];

        return this.store.getState().builds.visible.filter((b) => {
            return activeStates.indexOf(b.state.toString()) !== -1;
        });
    }

    get activeBuild() {
        let active = this.activeBuilds.last();
        return active;
    }

    get building(): boolean {
        return this.activeBuilds.size > 0;
    }

    onRouteActivate(routedComponent) {
        this.showSidebar = false;
        this.showActiveBuild = false;

        [
            PackageBuildsComponent,
            PackageLatestComponent,
            PackageReleaseComponent,
            PackageVersionsComponent
        ].forEach((c) => {
            if (routedComponent instanceof c) {
                this.showSidebar = true;
                this.showActiveBuild = true;
            }
        });

        this.fetchProject();
        this.fetchBuilds();
    }

    private fetchProject() {
        let token = this.store.getState().gitHub.authToken;

        if (this.origin && this.name) {
            this.store.dispatch(fetchProject(`${this.origin}/${this.name}`, token, false));
        }
    }

    private fetchBuilds() {
        this.store.dispatch(fetchBuilds(this.origin, this.name));
    }
}
