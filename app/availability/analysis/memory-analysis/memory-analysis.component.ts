import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppAnalysisResponse, IAbnormalTimePeriod, IAnalysisData } from '../../../shared/models/appanalysisresponse';
import { IDetectorAbnormalTimePeriod, IDetectorResponse } from '../../../shared/models/detectorresponse';
import { SummaryViewModel, SummaryHealthStatus } from '../../../shared/models/summary-view-model';
import { PortalActionService, ServerFarmDataService, AvailabilityLoggingService, AuthService, AppAnalysisService } from '../../../shared/services';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Component({
    selector: 'memory-analysis',
    templateUrl: 'memory-analysis.component.html'
})
export class MemoryAnalysisComponent implements OnInit {
    displayGraph: boolean = true;

    runtimeAvailabilityResponse: IDetectorResponse;
    siteLatencyResponse: IDetectorResponse;
    serviceHealthResponse: IDetectorResponse;
    memoryAnalysisResponse: IAppAnalysisResponse;

    pageReadsViewModel: SummaryViewModel;
    physicalMemoryViewModel: SummaryViewModel;
    committedViewModel: SummaryViewModel;

    readonly PageFileOperations: string = "pagefileoperations"
    readonly SiteMemoryAnalysis: string = "sitememoryanalysis"
    readonly CommittedMemoryUsage: string = "committedmemoryusage"


    subscriptionId: string;
    resourceGroup: string;
    siteName: string;
    slotName: string;

    constructor(private _route: ActivatedRoute, private _appAnalysisService: AppAnalysisService, private _logger: AvailabilityLoggingService) {

    }

    ngOnInit(): void {
        this._logger.LogAnalysisInitialized('Memory Analysis');

        this.subscriptionId = this._route.snapshot.params['subscriptionid'];
        this.resourceGroup = this._route.snapshot.params['resourcegroup'];
        this.siteName = this._route.snapshot.params['sitename'];
        this.slotName = this._route.snapshot.params['slot'] ? this._route.snapshot.params['slot'] : '';

        this._appAnalysisService.getAnalysisResource(this.subscriptionId, this.resourceGroup, this.siteName, this.slotName, 'memoryanalysis')
            .subscribe(data => {
                if (data) {
                    this.memoryAnalysisResponse = data;

                    let summaryDowntime = this.memoryAnalysisResponse.abnormalTimePeriods && this.memoryAnalysisResponse.abnormalTimePeriods.length > 0 ? this.memoryAnalysisResponse.abnormalTimePeriods[0] : undefined;

                    this.pageReadsViewModel = this.getSummaryViewModel(summaryDowntime, this.PageFileOperations, 'Page Reads/sec', false);
                    this.physicalMemoryViewModel = this.getSummaryViewModel(summaryDowntime, this.SiteMemoryAnalysis, 'Percent Physical Memory Used');
                    this.committedViewModel = this.getSummaryViewModel(summaryDowntime, this.CommittedMemoryUsage);

                    console.log(this.physicalMemoryViewModel);
                }

            });
    }

    getSummaryViewModel(summaryDowntime: IAbnormalTimePeriod, detectorName: string, topLevelSeries: string = '', excludeTopLevelInDetail: boolean = true): SummaryViewModel {

        let downtime = summaryDowntime ? summaryDowntime.events.find(detector => detector.source === detectorName) : null;
        let health = !downtime ?
            SummaryHealthStatus.Healthy : downtime.metaData[0].find(nvp => nvp.name === 'CurrentHealth').value === "Unhealthy" ?
                SummaryHealthStatus.Error : SummaryHealthStatus.Warning
        let detectorResponse = this.memoryAnalysisResponse.payload.find((analysisData: IAnalysisData) =>
            analysisData.source === detectorName
        );
        let graphMetaData = this.graphMetaData[detectorName];

        this._logger.LogMemorySummaryStatus(detectorName, health);

        return <SummaryViewModel>{
            detectorName: detectorName,
            health: health,
            loading: false,
            detectorAbnormalTimePeriod: downtime,
            detectorData: detectorResponse,
            mainMetricSets: detectorResponse ? (topLevelSeries !== '' ? detectorResponse.metrics.filter(x => x.name === topLevelSeries) : detectorResponse.metrics) : null,
            detailMetricSets: topLevelSeries !== '' && detectorResponse ? excludeTopLevelInDetail ? detectorResponse.metrics.filter(x => x.name !== topLevelSeries) : detectorResponse.metrics : null,
            mainMetricGraphTitle: graphMetaData.mainGraphTitle,
            mainMetricGraphDescription: graphMetaData.mainGraphDescriptions,
            perInstanceGraphTitle: graphMetaData.perInstanceGraphTitle,
            perInstanceGraphDescription: graphMetaData.perInstanceGraphDescription
        };
    }

    private graphMetaData: any = {
        'pagefileoperations': {
            mainGraphTitle: 'Page Reads/sec per Instance',
            mainGraphDescriptions: 'Page Reads/sec is the rate at which the disk was read to resolve hard page faults. Hard page faults occur when a process references a page in virtual memory that is not in working set or elsewhere in physical memory, and must be retrieved from disk.',
            perInstanceGraphTitle: null,
            perInstanceGraphDescription: null
        },
        'sitememoryanalysis': {
            mainGraphTitle: 'Overall Percent Physical Memory Usage per Instance',
            mainGraphDescriptions: 'This is the overall percent memory in use on each instance. It is the sum of the physical memory used by all processes on the instance, which include both system and application usage',
            perInstanceGraphTitle: 'Application Percent Physical Memory Usage',
            perInstanceGraphDescription: 'This shows the percent physical memory usage of each application on the specific instance selected.'
        },
        'committedmemoryusage': {
            mainGraphTitle: 'Committed MBytes per Instance',
            mainGraphDescriptions: 'Committed MBytes is the amount of committed virtual memory, in MegaBytes. Committed memory is the physical memory which has space reserved on the disk paging file(s).',
            perInstanceGraphTitle: null,
            perInstanceGraphDescription: null
        }
    }
}