import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { SignalsInspector } from './shared/components/signals-inspector/signals-inspector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SignalsInspector],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly inspectorOpen = signal(false);

  protected toggleInspector(): void {
    this.inspectorOpen.update((open) => !open);
  }
}
