import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  keyframes,
} from '@angular/animations';

// Fade-in animation
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);

// Slide-in from right (RTL-friendly)
export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '600ms ease-out',
      style({ transform: 'translateX(0)', opacity: 1 })
    ),
  ]),
]);

// Stagger animation for grids
export const staggerAnimation = trigger('staggerAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('100ms', [
          animate(
            '300ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// shared/animations/animations.ts
export const bounce = trigger('bounce', [
  transition('* => *', [
    animate(
      '0.3s ease',
      keyframes([
        style({ transform: 'scale(1)', offset: 0 }),
        style({ transform: 'scale(1.2)', offset: 0.5 }),
        style({ transform: 'scale(1)', offset: 1 }),
      ])
    ),
  ]),
]);
