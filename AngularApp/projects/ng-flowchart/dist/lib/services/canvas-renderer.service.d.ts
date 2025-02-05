import { ComponentRef, ViewContainerRef } from '@angular/core';
import { NgFlowchart } from '../model/flow.model';
import { CanvasFlow } from '../ng-flowchart-canvas.service';
import { NgFlowchartStepComponent } from '../ng-flowchart-step/ng-flowchart-step.component';
import { OptionsService } from './options.service';
import * as i0 from "@angular/core";
export declare type DropProximity = {
    step: NgFlowchartStepComponent;
    position: NgFlowchart.DropPosition;
    proximity: number;
};
export declare class CanvasRendererService {
    private options;
    private viewContainer;
    private scale;
    private scaleDebounceTimer;
    constructor(options: OptionsService);
    init(viewContainer: ViewContainerRef): void;
    renderRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent?: DragEvent): void;
    renderNonRoot(step: ComponentRef<NgFlowchartStepComponent>, dragEvent?: DragEvent): void;
    updatePosition(step: NgFlowchartStepComponent, dragEvent: DragEvent): void;
    private getStepGap;
    private renderChildTree;
    render(flow: CanvasFlow, pretty?: boolean, skipAdjustDimensions?: boolean): void;
    private resetAdjustDimensions;
    private findDropLocationForHover;
    private adjustDimensions;
    private getTotalTreeWidth;
    private findBestMatchForSteps;
    findAndShowClosestDrop(dragStep: NgFlowchart.Step, event: DragEvent, steps: ReadonlyArray<NgFlowchartStepComponent>): NgFlowchart.DropTarget;
    showSnaps(dragStep: NgFlowchart.PendingStep): void;
    clearAllSnapIndicators(steps: ReadonlyArray<NgFlowchartStepComponent>): void;
    private setRootPosition;
    private getRelativeXY;
    private getCanvasTopCenterPosition;
    private getCanvasCenterPosition;
    private getCanvasContentElement;
    private isNestedCanvas;
    resetScale(flow: CanvasFlow): void;
    scaleUp(flow: CanvasFlow, step?: number): void;
    scaleDown(flow: CanvasFlow, step?: number): void;
    setScale(flow: CanvasFlow, scaleValue: number): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CanvasRendererService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CanvasRendererService>;
}
