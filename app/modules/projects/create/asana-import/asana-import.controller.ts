/*
 * Copyright (C) 2014-2017 Taiga Agile LLC <taiga@taiga.io>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * File: asana-import.controller.coffee
 */

import {defineImmutableProperty} from "../../../../libs/utils"

export class AsanaImportController {
    asanaImportService:any
    confirm:any
    translate:any
    importProjectService:any
    step:string
    project:any
    fetchingUsers:any

    static initClass() {
        this.$inject = [
            'tgAsanaImportService',
            '$tgConfirm',
            '$translate',
            'tgImportProjectService',
        ];
    }

    constructor(asanaImportService, confirm, translate, importProjectService) {
        this.asanaImportService = asanaImportService;
        this.confirm = confirm;
        this.translate = translate;
        this.importProjectService = importProjectService;
        this.step = 'autorization-asana';
        this.project = null;
        defineImmutableProperty(this, 'projects', () => { return this.asanaImportService.projects; });
        defineImmutableProperty(this, 'members', () => { return this.asanaImportService.projectUsers; });
    }

    startProjectSelector() {
        this.step = 'project-select-asana';
        return this.asanaImportService.fetchProjects();
    }

    onSelectProject(project) {
        this.step = 'project-form-asana';
        this.project = project;
        this.fetchingUsers = true;

        return this.asanaImportService.fetchUsers(this.project.get('id')).then(() => this.fetchingUsers = false);
    }

    onSaveProjectDetails(project) {
        this.project = project;
        return this.step = 'project-members-asana';
    }

    onCancelMemberSelection() {
        return this.step = 'project-form-asana';
    }

    startImport(users) {
        let loader = this.confirm.loader(this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.TITLE'), this.translate.instant('PROJECT.IMPORT.IN_PROGRESS.DESCRIPTION'), true);

        loader.start();

        let promise = this.asanaImportService.importProject(
            this.project.get('name'),
            this.project.get('description'),
            this.project.get('id'),
            users,
            this.project.get('keepExternalReference'),
            this.project.get('is_private'),
            this.project.get('project_type')
        );

        return this.importProjectService.importPromise(promise).then(() => loader.stop());
    }

    submitUserSelection(users) {
        this.startImport(users);
        return null;
    }
}
AsanaImportController.initClass();
