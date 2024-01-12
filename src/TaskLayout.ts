import { TaskLayoutOptions2 } from './Layout/TaskLayoutOptions';
import { QueryLayoutOptions } from './QueryLayoutOptions';

/**
 * Various rendering options of tasks in a query.
 * See applyOptions below when adding options here.
 *
 * @see QueryLayoutOptions
 */
export class TaskLayoutOptions {
    // NEW_TASK_FIELD_EDIT_REQUIRED
    hidePriority: boolean = false;
    hideCreatedDate: boolean = false;
    hideStartDate: boolean = false;
    hideScheduledDate: boolean = false;
    hideDoneDate: boolean = false;
    hideCancelledDate: boolean = false;
    hideDueDate: boolean = false;
    hideRecurrenceRule: boolean = false;
    hideTags: boolean = false;
}

export type TaskLayoutComponent =
    // NEW_TASK_FIELD_EDIT_REQUIRED
    | 'description'
    | 'priority'
    | 'recurrenceRule'
    | 'createdDate'
    | 'startDate'
    | 'scheduledDate'
    | 'dueDate'
    | 'doneDate'
    | 'cancelledDate'
    | 'blockLink';

export class QueryLayout {
    protected queryLayoutOptions: QueryLayoutOptions;

    constructor(queryLayoutOptions?: QueryLayoutOptions) {
        if (queryLayoutOptions) {
            this.queryLayoutOptions = queryLayoutOptions;
        } else {
            this.queryLayoutOptions = new QueryLayoutOptions();
        }
    }

    protected applyQueryLayoutOptions(taskListHiddenClasses: string[]) {
        const componentsToGenerateClassesOnly: [boolean, string][] = [
            // The following components are handled in QueryRenderer.ts and thus are not part of the same flow that
            // hides TaskLayoutComponent items. However, we still want to have 'tasks-layout-hide' items for them
            // (see https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1866).
            // This can benefit from some refactoring, i.e. render these components in a similar flow rather than
            // separately.
            [this.queryLayoutOptions.hideUrgency, 'urgency'],
            [this.queryLayoutOptions.hideBacklinks, 'backlinks'],
            [this.queryLayoutOptions.hideEditButton, 'edit-button'],
            [this.queryLayoutOptions.hidePostponeButton, 'postpone-button'],
        ];
        for (const [hide, component] of componentsToGenerateClassesOnly) {
            generateHiddenClassForTaskList(taskListHiddenClasses, hide, component);
        }

        if (this.queryLayoutOptions.shortMode) taskListHiddenClasses.push('tasks-layout-short-mode');
    }
}

function generateHiddenClassForTaskList(taskListHiddenClasses: string[], hide: boolean, component: string) {
    if (hide) {
        taskListHiddenClasses.push(hiddenComponentClassName(component));
    }
}

function hiddenComponentClassName(component: string) {
    return `tasks-layout-hide-${component}`;
}

export const defaultLayout: TaskLayoutComponent[] = [
    // NEW_TASK_FIELD_EDIT_REQUIRED
    'description',
    'priority',
    'recurrenceRule',
    'createdDate',
    'startDate',
    'scheduledDate',
    'dueDate',
    'cancelledDate',
    'doneDate',
    'blockLink',
];

/**
 * This represents the desired layout of tasks when they are rendered in a given configuration.
 * The layout is used when flattening the task to a string and when rendering queries, and can be
 * modified by applying {@link TaskLayoutOptions} objects.
 */
export class TaskLayout extends QueryLayout {
    public shownTaskLayoutComponents(): TaskLayoutComponent[] {
        return this.taskLayoutOptions2.shownComponents;
    }
    public hiddenTaskLayoutComponents(): TaskLayoutComponent[] {
        return this.taskLayoutOptions2.hiddenComponents;
    }
    public taskListHiddenClasses(): string[] {
        return this._taskListHiddenClasses;
    }
    public defaultLayout: TaskLayoutComponent[] = defaultLayout;
    private taskLayoutOptions: TaskLayoutOptions;
    private taskLayoutOptions2: TaskLayoutOptions2;
    private _taskListHiddenClasses: string[] = [];

    constructor(
        taskLayoutOptions?: TaskLayoutOptions,
        queryLayoutOptions?: QueryLayoutOptions,
        taskLayoutOptions2?: TaskLayoutOptions2,
    ) {
        super(queryLayoutOptions);

        if (taskLayoutOptions) {
            this.taskLayoutOptions = taskLayoutOptions;
        } else {
            this.taskLayoutOptions = new TaskLayoutOptions();
        }

        if (taskLayoutOptions2) {
            this.taskLayoutOptions2 = taskLayoutOptions2;
        } else {
            this.taskLayoutOptions2 = new TaskLayoutOptions2();
        }
        this.applyOptions();
    }

    private applyOptions() {
        this.applyTaskLayoutOptions();
        this.applyQueryLayoutOptions(this._taskListHiddenClasses);
    }

    private applyTaskLayoutOptions() {
        this.taskLayoutOptions2.toggleableComponents.forEach((component) => {
            generateHiddenClassForTaskList(
                this._taskListHiddenClasses,
                !this.taskLayoutOptions2.isShown(component),
                component,
            );
        });

        // Tags are hidden, rather than removed. See tasks-layout-hide-tags in styles.css.
        generateHiddenClassForTaskList(this._taskListHiddenClasses, this.taskLayoutOptions.hideTags, 'tags');
    }
}
