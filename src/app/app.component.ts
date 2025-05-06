import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ScrollToTopComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'AQRAB - أقربلك';
  constructor(private router: Router, private renderer: Renderer2) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      });
    this.setupFullscreenListener();
  }

  private setupFullscreenListener() {
    this.renderer.listen('document', 'fullscreenchange', () => {
      const iframe = document.querySelector(
        '.video-container iframe'
      ) as HTMLIFrameElement | null;
      if (iframe) {
        // Add null check
        if (document.fullscreenElement) {
          iframe.style.width = '100vw';
          iframe.style.height = '56.25vw';
        } else {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
        }
      }
    });

    this.renderer.listen('document', 'webkitfullscreenchange', () => {
      const iframe = document.querySelector(
        '.video-container iframe'
      ) as HTMLIFrameElement | null;
      if (iframe) {
        // Add null check
        if ((document as any).webkitFullscreenElement) {
          // Cast to any for vendor prefix
          iframe.style.width = '100vw';
          iframe.style.height = '56.25vw';
        } else {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
        }
      }
    });

    this.renderer.listen('document', 'mozfullscreenchange', () => {
      const iframe = document.querySelector(
        '.video-container iframe'
      ) as HTMLIFrameElement | null;
      if (iframe) {
        // Add null check
        if ((document as any).mozFullScreenElement) {
          // Cast to any for vendor prefix
          iframe.style.width = '100vw';
          iframe.style.height = '56.25vw';
        } else {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
        }
      }
    });
  }
}
