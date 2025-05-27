import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, NgZone, OnDestroy, HostListener, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { register } from 'swiper/element';
import { EnseignesService } from '../../services/enseignes.service';
import { catchError, finalize, of, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout, retry, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Typage pour SwiperContainer
interface EnseigneResponse {
  id: number;
  nom: string;
  description: string;
  photo?: string;
  noteMoyenne?: number;
  categorie?: string;
  slogan?: string;
}

interface ApiResponse {
  enseignes: EnseigneResponse[];
}

type SwiperContainer = Element & {
  swiper: any;
  initialize: () => void;
};

// Enregistrer Swiper
register();

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'], 
  imports: [CommonModule],
schemas: [CUSTOM_ELEMENTS_SCHEMA]
})


export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('swiper') swiperElement?: ElementRef<SwiperContainer>;

  user: any = null;
  currentIndex = 0;
  intervalId: any = null;
  isUserInteracting = false;
  isLoading = true;
  hasError = false;
  private apiUrl = environment.apiUrl;
  enseignes: any[] = [];
  private subscriptions: Subscription[] = [];
  private observer: MutationObserver | undefined;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private enseigneService: EnseignesService,
    private http: HttpClient
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.detectDeviceType();
    this.updateSwiper();
  }

  ngOnInit(): void {
    const userSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.subscriptions.push(userSub);
  
    this.detectDeviceType();
    this.loadRandomEnseignes();
  
    // ⬇ Rafraîchissement complet si on revient sur cette page
    const navSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Important : attendre que la vue soit prête
        setTimeout(() => {
          this.detectDeviceType();
          this.loadRandomEnseignes(); // recharge des données
          setTimeout(() => {
            this.initializeSwiper(); // réinit swiper
            this.applyActiveCardClass(); // réappliquer effet
          }, 150);
        }, 50); // petit délai pour laisser le DOM respirer
      });
    this.subscriptions.push(navSub);
  }  

  detectDeviceType(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.swiper) {
      if (!this.isMobile) {
        // Paramètres spécifiques pour desktop
        this.swiper.params.slidesPerView = 1;
        this.swiper.params.spaceBetween = 20;
      } else {
        // Paramètres pour mobile
        this.swiper.params.slidesPerView = 1.05;
        this.swiper.params.spaceBetween = 15;
      }
      this.swiper.update();
    }
  }

  loadRandomEnseignes(): void {
    this.isLoading = true;
    this.hasError = false;
    this.enseignes = [];
    this.currentIndex = 0; // Assurez-vous que currentIndex est à 0
    
    this.enseigneService.getRandomEnseignes(10).pipe(
      finalize(() => {
        this.isLoading = false;
        // Augmentez le délai pour s'assurer que le DOM est bien rendu
        setTimeout(() => {
          this.initializeSwiper();
          this.applyActiveCardClass();
         
        }, 150);
      })
    ).subscribe({
      next: (enseignes) => {
        console.log('Enseignes loaded successfully:', enseignes);
        this.enseignes = enseignes.map(e => ({
          id: e.id,
          name: e.nom,
          description: e.description,
          image: e.photo || 'assets/default.jpg',
          rating: e.noteMoyenne,
          category: e.categorie,
          route: `/enseigne/${e.id}`,
          imageLoaded: false,
          imageFocus: e.imageFocus || 'center',
          slogan: e.slogan || 'Slogan par défaut'
        }));
      },
      error: (err) => {
        console.error('Failed to load random enseignes:', err);
        this.hasError = true;
        this.enseignes = Array(10).fill(0).map((_, i) => ({
          id: i + 1,
          name: `Enseigne ${i + 1}`,
          description: "Description par défaut",
          image: "assets/default-enseigne.jpg",
          rating: 3.5,
          category: "Divers",
          route: `/enseigne/${i + 1}`,
          imageLoaded: true,
          imageFocus: 'center',
          slogan: "Slogan par défaut"
        }));
      }
    });
  }

  getRandomEnseignes(count: number): Observable<EnseigneResponse[]> {
    const url = `${this.apiUrl}/enseignes/random/${count}`;
    console.log(`Fetching ${count} random enseignes from: ${url}`);

    return this.http.get<ApiResponse>(url).pipe(
      timeout(10000),
      retry(2),
      map(response => {
        if (!response?.enseignes) {
          throw new Error('Réponse invalide du serveur');
        }

        return response.enseignes.map(e => ({
          id: e.id,
          nom: e.nom,
          description: e.description,
          photo: e.photo || 'assets/default-enseigne.jpg',
          noteMoyenne: e.noteMoyenne || 0,
          categorie: e.categorie || 'Non classé',
          imageFocus: e.photo || 'center',
          slogan: e.slogan || 'Slogan par défaut'
        }));
      }),
      catchError(error => {
        console.error('Error fetching random enseignes:', error);
        return of(Array(count).fill(0).map((_, i) => ({
          id: i + 1,
          nom: `Enseigne de secours ${i + 1}`,
          description: "Description par défaut",
          photo: "assets/default-enseigne.jpg",
          noteMoyenne: 3.5,
          slogan : "Slogan par défaut",
          categorie: "Divers",
          imageFocus: 'center'
        })));
      })
    );
  }

  initializeSwiper(): void {
    if (this.swiper) {
      console.log('Mise à jour du Swiper avec', this.enseignes.length, 'enseignes');
      this.swiper.update();

      if (this.enseignes.length > 0) {
        this.swiper.slideToLoop(0, 0);
        // S'assurer que le premier slide est actif
        this.currentIndex = 0;
        this.applyActiveCardClass();
        this.startAutoplay();
      }
    } else {
      console.warn('Swiper non disponible lors de l\'initialisation');
    }
  }

  get swiper() {
    return this.swiperElement?.nativeElement?.swiper;
  }

  ngAfterViewInit(): void {
    if (this.swiperElement?.nativeElement) {
      const swiperParams = {
        slidesPerView: this.isMobile ? 1.05 : 1.5,
        centeredSlides: true,
        loop: true,
        speed: 700,
        spaceBetween: this.isMobile ? 15 : 20,
        initialSlide: 0,
        effect: 'slide',
        autoHeight: false,
        grabCursor: true,
        threshold: 5,
        resistance: true,
        resistanceRatio: 0.85,
        touchRatio: 1,
        touchStartPreventDefault: false,
        cssMode: false,
        virtual: false,
        watchSlidesProgress: true,
        preventInteractionOnTransition: true,
        observer: true,
        observeParents: true,
        loopAdditionalSlides: 2,
        updateOnWindowResize: true,
        centerInsufficientSlides: true,
        slideToClickedSlide: true,

        breakpoints: {
          320: { slidesPerView: 1.05 },
          480: { slidesPerView: 1.1 },
          768: { slidesPerView: 1.5 },
          992: { slidesPerView: 2 }
        },
        on: {
          beforeInit: () => {
            console.log('Swiper avant initialisation');
          },
          init: () => {
            console.log('Swiper initialisé');
            if (this.swiper) {
              this.currentIndex = 0;
            this.swiper.activeIndex = 0;
            this.swiper.realIndex = 0;
              this.swiper.updateSize();
              this.swiper.updateSlides();
              this.swiper.updateProgress();
              this.swiper.updateSlidesClasses();
              
              // Mettre à jour currentIndex pour être sûr
              this.currentIndex = this.swiper.realIndex;
              
              // Appliquer les classes immédiatement et après un court délai
              this.applyActiveCardClass();
              setTimeout(() => this.applyActiveCardClass(), 200);
              
              this.initializeMutationObserver();
            }
          },
          slideChange: () => {
            if (this.swiper) {
              this.ngZone.run(() => {
                this.currentIndex = this.swiper.realIndex;
                console.log('Current index updated:', this.currentIndex);

                setTimeout(() => {
                  this.applyActiveCardClass();
                }, 50);
              });
            }
          },
          touchStart: () => {
            this.isUserInteracting = true;
            this.stopAutoplay();
          },
          touchEnd: () => {
            this.isUserInteracting = false;
            if (this.swiper) {
              this.swiper.updateSize();
              this.swiper.updateSlides();
              this.swiper.updateProgress();
              this.swiper.updateSlidesClasses();
            }
            this.startAutoplay();
          },
          loopFix: () => {
            console.log('Correctif de boucle déclenché');
          },
          transitionStart: () => {
            console.log('Transition démarrée');
          },
          transitionEnd: () => {
            console.log('Transition terminée');
            if (this.swiper) {
              this.currentIndex = this.swiper.realIndex; // Ajouter cette ligne
              this.swiper.updateSize();
              this.swiper.updateSlides();
              this.swiper.updateProgress();
              this.swiper.updateSlidesClasses();
              this.applyActiveCardClass();
            }
          }
        }
      };

      Object.assign(this.swiperElement.nativeElement, swiperParams);
      this.swiperElement.nativeElement.initialize();
      
      // Attendre que le swiper soit complètement initialisé
      setTimeout(() => {
        this.detectDeviceType();
        this.applyActiveCardClass();
      }, 300);
    }
  }

  initializeMutationObserver(): void {
    const targetNode = document.querySelector('swiper-container');
    if (!targetNode) {
      console.warn('Le conteneur Swiper n\'est pas trouvé dans le DOM.');
      return;
    }

    this.observer = new MutationObserver(() => {
      this.applyActiveCardClass();
    });

    const config = {
      attributes: true,
      childList: true,
      subtree: true,
    };

    this.observer.observe(targetNode, config);
  }

  applyActiveCardClass(): void {
    this.ngZone.run(() => {
      // Récupérer l'index réel du swiper
      const activeIndex = this.swiper?.realIndex || 0;
      this.currentIndex = activeIndex; // S'assurer que currentIndex est toujours synchronisé
      
      const slides = document.querySelectorAll('swiper-slide');
      
      slides.forEach((slide, index) => {
        const cardContainer = slide.querySelector('.card-container');
        
        // Utiliser l'index modulo pour gérer les slides dupliqués en mode boucle
        const slideIndex = index % this.enseignes.length;
        
        if (cardContainer) {
          // Appliquer ou retirer la classe active
          if (slideIndex === activeIndex) {
            cardContainer.classList.add('active-card');
            // Assurer une animation fluide pour la carte active
            (slide as HTMLElement).classList.add('swiper-slide-transition');
          } else {
            cardContainer.classList.remove('active-card');
            // Assurer une animation fluide pour les cartes non actives
            (slide as HTMLElement).classList.add('swiper-slide-transition');
          }
        }
      });
      
      // Retarder légèrement la suppression de la classe de transition
      setTimeout(() => {
        document.querySelectorAll('.swiper-slide-transition').forEach(slide => {
          (slide as HTMLElement).classList.remove('swiper-slide-transition');
        });
      }, 650);
    });
  }
  

  swipePrev(): void {
    if (this.swiper) {
      this.isUserInteracting = true;
      this.stopAutoplay();

      this.swiper.params.touchRatio = 0;
      this.swiper.slidePrev(600);

      setTimeout(() => {
        if (this.swiper) {
          this.swiper.updateSize();
          this.swiper.updateSlides();
          this.swiper.updateProgress();
          this.swiper.updateSlidesClasses();

          this.swiper.params.touchRatio = 1;
          this.isUserInteracting = false;
          this.startAutoplay();
        }
      }, 650);
    }
  }

  swipeNext(): void {
    if (this.swiper) {
      this.isUserInteracting = true;
      this.stopAutoplay();

      this.swiper.params.touchRatio = 0;
      this.swiper.slideNext(600);

      setTimeout(() => {
        if (this.swiper) {
          this.swiper.updateSize();
          this.swiper.updateSlides();
          this.swiper.updateProgress();
          this.swiper.updateSlidesClasses();

          this.swiper.params.touchRatio = 1;
          this.isUserInteracting = false;
          this.startAutoplay();
        }
      }, 650);
    }
  }

  goToSlide(index: number): void {
    if (this.swiper) {
      this.isUserInteracting = true;
      this.stopAutoplay();

      this.swiper.params.touchRatio = 0;
      this.swiper.slideToLoop(index, 600);

      setTimeout(() => {
        if (this.swiper) {
          this.swiper.updateSize();
          this.swiper.updateSlides();
          this.swiper.updateProgress();
          this.swiper.updateSlidesClasses();

          this.swiper.params.touchRatio = 1;
          this.isUserInteracting = false;
          this.startAutoplay();
        }
      }, 650);
    }
  }

  startAutoplay(): void {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        if (this.swiper && !this.isUserInteracting) {
          // Utilisez exactement la même méthode que swipeNext() pour assurer la cohérence
          this.performSwipeNext(true); // Passer true pour indiquer que c'est un autoplay
        }
      }, 5000);
    }
  }

  stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  performSwipeNext(isAutoplay: boolean = false): void {
    if (this.swiper) {
      if (!isAutoplay) {
        // Uniquement si c'est un swipe manuel
        this.isUserInteracting = true;
        this.stopAutoplay();
      }
  
      this.swiper.params.touchRatio = 0;
      this.swiper.slideNext(600);
  
      setTimeout(() => {
        if (this.swiper) {
          this.swiper.updateSize();
          this.swiper.updateSlides();
          this.swiper.updateProgress();
          this.swiper.updateSlidesClasses();
          this.currentIndex = this.swiper.realIndex;
          this.applyActiveCardClass();
  
          this.swiper.params.touchRatio = 1;
          
          if (!isAutoplay) {
            // Uniquement si c'est un swipe manuel
            this.isUserInteracting = false;
            this.startAutoplay();
          }
        }
      }, 650);
    }
  }
  updateSwiper(): void {
    if (this.swiper) {
      this.swiper.update();


      if (this.swiper.params.loop) {
        this.swiper.loopDestroy();
        this.swiper.loopCreate();
      }
      if (this.currentIndex !== this.swiper.realIndex) {
        this.currentIndex = this.swiper.realIndex;
      }
      this.applyActiveCardClass();
    }
  }

  navigateToEnseigne(enseigneId: number, event?: MouseEvent) {
    try {
      event?.preventDefault();
      event?.stopPropagation();

      if (event) {
        const target = event.target as HTMLElement;
        const cardContainer = target.closest?.('.card-container');

        cardContainer?.classList.add('clicked');
        setTimeout(() => cardContainer?.classList.remove('clicked'), 200);
      }

      const enseigne = this.enseignes?.find(e => e.id === enseigneId);

      if (!enseigne) {
        console.warn('Enseigne non trouvée');
        return;
      }
      this.router.navigate(['/enseigne', enseigneId], {
        state: {
          enseigneData: enseigne,
          fromCarousel: true
        }
      });

    } catch (error) {
      console.error('Erreur de navigation:', error);
      this.router.navigate(['/enseigne', enseigneId]);
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}