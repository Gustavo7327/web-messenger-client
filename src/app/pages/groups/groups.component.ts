import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../services/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'groups-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupsComponent {
  private readonly groupService = inject(GroupService);
  private readonly router = inject(Router);

  protected readonly groups = this.groupService.groups;
  protected readonly newGroupName = signal('');
  protected readonly newGroupDescription = signal('');
  protected readonly searchQuery = signal('');
  protected readonly showForm = signal(false);

  protected readonly filteredGroups = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.groups();
    
    return this.groups().filter(group =>
      group.name.toLowerCase().includes(query) ||
      (group.description?.toLowerCase() || '').includes(query)
    );
  });

  protected createGroup(): void {
    const payload = {
      name: this.newGroupName().trim(),
      description: this.newGroupDescription().trim() || undefined
    };

    if (!payload.name) return;

    this.groupService.createGroup(payload).subscribe({
      next: () => {
        this.newGroupName.set('');
        this.newGroupDescription.set('');
        this.showForm.set(false);
      },
      error: (err) => console.error('Falha ao criar grupo:', err)
    });
  }

  protected openGroupChat(groupId: number): void {
    this.router.navigate(['/dashboard'], { queryParams: { groupId } });
  }

  protected deleteGroup(groupId: number): void {
    if (confirm('Tem certeza que deseja deletar este grupo?')) {
      console.log('Deletar grupo:', groupId);
    }
  }

  protected editGroup(groupId: number): void {
    console.log('Editar grupo:', groupId);
  }
}

