import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MdIconModule, MdIconRegistry, MdProgressBarModule, MdTooltipModule } from "@angular/material";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BreadcrumbsComponent } from "./breadcrumbs/breadcrumbs.component";
import { ChannelsComponent } from "./channels/channels.component";
import { CheckingInputComponent } from "./checking-input/checking-input.component";
import { CopyableComponent } from "./copyable/copyable.component";
import { IconComponent } from "./icon/icon.component";
import { PackageInfoComponent } from "./package-info/package-info.component";
import { PackageListComponent } from "./package-list/package-list.component";
import { ProgressBarComponent } from "./progress-bar/progress-bar.component";
import { PlatformIconComponent } from "./platform-icon/platform-icon.component";
import { TabsComponent } from "./tabs/TabsComponent";
import { TabComponent } from "./tabs/TabComponent";
import { FormProgressComponent } from "./form-progress/form-progress.component";
import { GitHubRepoPickerComponent } from "./github-repo-picker/GitHubRepoPickerComponent";
import { SCMReposPageComponent } from "../scm-repos-page/SCMReposPageComponent";
import { RepoFilterPipe } from "../pipes/repoFilter.pipe";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    MdIconModule,
    MdProgressBarModule,
    MdTooltipModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    BreadcrumbsComponent,
    ChannelsComponent,
    CheckingInputComponent,
    CopyableComponent,
    IconComponent,
    PackageInfoComponent,
    PackageListComponent,
    ProgressBarComponent,
    PlatformIconComponent,
    TabsComponent,
    TabComponent,
    FormProgressComponent,
    SCMReposPageComponent,
    GitHubRepoPickerComponent,
    RepoFilterPipe
  ],
  exports: [
    BreadcrumbsComponent,
    ChannelsComponent,
    CheckingInputComponent,
    CopyableComponent,
    IconComponent,
    PackageInfoComponent,
    PackageListComponent,
    ProgressBarComponent,
    PlatformIconComponent,
    TabsComponent,
    TabComponent,
    FormProgressComponent,
    SCMReposPageComponent,
    GitHubRepoPickerComponent
  ]
})
export class SharedModule {
  constructor(private mdIconRegistry: MdIconRegistry, private sanitizer: DomSanitizer) {

    // At the time of this monkeypatching, the SVG settings applied by MdIconRegistry
    // were missing the `viewBox` attribute, which is responsible for mapping the coordinate space
    // of an SVG image to that of the viewport, enabling proper scaling. While we await resolution
    // of the issue below, we'll go ahead and plow right over Angular's implementation,
    // 'cause JavaScript is awesome.
    // https://github.com/angular/material2/issues/5188
    // https://github.com/angular/material2/blob/bef6271c617f6904cc360454805ea080e2212f2a/src/lib/icon/icon-registry.ts#L424-L436
    mdIconRegistry["_setSvgAttributes"] = (svg: SVGElement): SVGElement => {

      if (!svg.getAttribute("xmlns")) {
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      }

      svg.setAttribute("fit", "");
      svg.setAttribute("height", "100%");
      svg.setAttribute("width", "100%");
      svg.setAttribute("viewBox", "0 0 24 24"); // This is the one we care about.
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.setAttribute("focusable", "false");

      return svg;
    };

    mdIconRegistry.addSvgIconSet(
        sanitizer.bypassSecurityTrustResourceUrl("/assets/images/icons/all.svg")
    );
  }
}
