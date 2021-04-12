import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CommonLoadingDirective } from 'src/app/shared/Loading/common-loading.directive';
import { CentrifugalPumpPrescriptiveModel } from './recycle-model';

@Component({
  selector: 'app-recycle-bin',
  templateUrl: './recycle-bin.component.html',
  styleUrls: ['./recycle-bin.component.scss'],
  providers: [MessageService]
})
export class RecycleBinComponent implements OnInit {

  public RecycleCentrifugalPumpChildData: any = [];
  public RecycleCentrifugalPumpChildList: any = [];
  public RecycleCentrifugalPumpWholeData: any = [];
  public FMChild: any;
  centrifugalPumpPrescriptiveOBJ: CentrifugalPumpPrescriptiveModel = new CentrifugalPumpPrescriptiveModel();

  constructor(private http: HttpClient,
    private commonLoadingDirective: CommonLoadingDirective,
    private messageService: MessageService,) { }

  ngOnInit() {
    this.getCentrifugalPumpRecycleChildData();
    this.getCentrifugalPumpRecycleWholeData();
  }


  getCentrifugalPumpRecycleChildData() {
    this.http.get('api/PrescriptiveAPI/CFRecycleDataForChild')
      .subscribe((res: any) => {
        for (let index = 0; index < res.length; index++) {
          let obj = {};
          if (res.length > 0) {
            obj['RCPPMId'] = res[index].RCPPMId;
            obj['RCPFMId'] = res[index].RCPFMId;
            obj['UserId'] = res[index].UserId;
            obj['CPPFMId'] = res[index].CPPFMId;
            obj['CFPPrescriptiveId'] = res[index].CFPPrescriptiveId;
            obj['FunctionMode'] = res[index].FunctionMode;
            obj['LocalEffect'] = res[index].LocalEffect;
            obj['SystemEffect'] = res[index].SystemEffect;
            obj['Consequence'] = res[index].Consequence;
            obj['DownTimeFactor'] = res[index].DownTimeFactor;
            obj['ScrapeFactor'] = res[index].ScrapeFactor;
            obj['SafetyFactor'] = res[index].SafetyFactor;
            obj['ProtectionFactor'] = res[index].ProtectionFactor;
            obj['FrequencyFactor'] = res[index].FrequencyFactor;
            obj['AttachmentDBPath'] = res[index].AttachmentDBPath;
            obj['AttachmentFullPath'] = res[index].AttachmentFullPath;
            obj['Remark'] = res[index].Remark;
            obj['DeletedFMTree'] = res[index].DeletedFMTree;
            this.RecycleCentrifugalPumpChildData.push(obj);
          }
        }
        this.RecycleCentrifugalPumpChildList = res;
      }, err => {
        console.log(err.err);
      }
      )
  }


  getCentrifugalPumpRecycleWholeData() {
    this.commonLoadingDirective.showLoading(true, 'Almost done...');
    this.http.get('api/PrescriptiveAPI/CFRecycleWholeData')
      .subscribe(
        res => {
          this.RecycleCentrifugalPumpWholeData = res;
        }, err => {
          console.log(err.err);
        });
  }

  async Restore(data) {
    if (data.FunctionMode != undefined) {
      var FailureMode = data.FunctionMode
      var LE = data.LocalEffect
      var SE = data.SystemEffect
      var FMToRestore = JSON.parse(data.DeletedFMTree)
      var LSToRestore = JSON.parse(data.DeletedFMTree)
      LSToRestore.children.splice(2, 1)
      var indexAtTreeRestore = FMToRestore.label - 1;
      this.http.get('api/PrescriptiveAPI/GetPrescriptiveById?id=' + data.CFPPrescriptiveId)
        .subscribe((res: any) => {
          const DataToRestore = res;
          var consTree: any = [], LSTree: any = []
          consTree = JSON.parse(DataToRestore.FMWithConsequenceTree)
          LSTree = JSON.parse(DataToRestore.FailureModeWithLSETree)
          consTree[0].children[0].children[0].children.splice(indexAtTreeRestore, 0, FMToRestore);
          LSTree[0].children[0].children[0].children.splice(indexAtTreeRestore, 0, LSToRestore);
          var FMWithConsequenceTree: string = JSON.stringify(consTree);
          var FailureModeWithLSETree: string = JSON.stringify(LSTree);
          let obj = {}
          obj['CPPFMId'] = 0;
          obj['CFPPrescriptiveId'] = DataToRestore.CFPPrescriptiveId;
          obj['FunctionMode'] = data.FunctionMode;
          obj['LocalEffect'] = data.LocalEffect;
          obj['SystemEffect'] = data.SystemEffect;
          if (data.Consequence != undefined) {
            obj['Consequence'] = data.Consequence;
          } else { obj['Consequence'] = "" }

          obj['DownTimeFactor'] = data.DownTimeFactor;
          obj['ScrapeFactor'] = data.ScrapeFactor;
          obj['SafetyFactor'] = data.SafetyFactor;
          obj['ProtectionFactor'] = data.ProtectionFactor;
          obj['FrequencyFactor'] = data.FrequencyFactor;
          obj['AttachmentDBPath'] = data.AttachmentDBPath;
          obj['AttachmentFullPath'] = data.AttachmentFullPath;
          obj['Remark'] = data.Remark;
          obj['Pattern'] = data.Pattern;
          this.centrifugalPumpPrescriptiveOBJ.centrifugalPumpPrescriptiveFailureModes.push(obj)
          this.centrifugalPumpPrescriptiveOBJ.CFPPrescriptiveId = DataToRestore.CFPPrescriptiveId;
          this.centrifugalPumpPrescriptiveOBJ.FMWithConsequenceTree = FMWithConsequenceTree
          this.centrifugalPumpPrescriptiveOBJ.FailureModeWithLSETree = FailureModeWithLSETree

          this.http.put('api/PrescriptiveAPI/FunctionModeAndConsequenceUpdate', this.centrifugalPumpPrescriptiveOBJ)
            .subscribe(
              (res: any) => {
                this.messageService.add({ severity: 'success', summary: 'success', detail: 'Successfully restored' });
                const params = new HttpParams()
                  .set("RCPPMId", data.RCPPMId)
                  .set("RCPFMId", data.RCPFMId)
                this.http.delete('api/PrescriptiveAPI/DeleteRecycleWholeData', { params })
                  .subscribe(res => {
                    this.getCentrifugalPumpRecycleChildData();
                    this.messageService.add({ severity: 'success', summary: 'success', detail: 'Failure Mode Removed from Recycle Bin' });
                  }, err => {
                    console.log(err.err)
                    this.getCentrifugalPumpRecycleChildData();
                  });
              }, err => {
                console.log(err.error);
              });

        }, err => {
          this.messageService.add({ severity: 'warn', detail: err.error });
          console.log(err.err)
        });

    } else if (data.ComponentCriticalityFactor != undefined) {

      this.centrifugalPumpPrescriptiveOBJ.CFPPrescriptiveId = 0
      this.centrifugalPumpPrescriptiveOBJ.UserId = data.UserId
      this.centrifugalPumpPrescriptiveOBJ.MachineType = data.MachineType
      this.centrifugalPumpPrescriptiveOBJ.EquipmentType = data.EquipmentType
      this.centrifugalPumpPrescriptiveOBJ.TagNumber = data.TagNumber
      this.centrifugalPumpPrescriptiveOBJ.FunctionFluidType = data.FunctionFluidType
      this.centrifugalPumpPrescriptiveOBJ.FunctionRatedHead = data.FunctionRatedHead
      this.centrifugalPumpPrescriptiveOBJ.FunctionPeriodType = data.FunctionPeriodType
      this.centrifugalPumpPrescriptiveOBJ.FunctionFailure = data.FunctionFailure
      this.centrifugalPumpPrescriptiveOBJ.Date = data.Date
      this.centrifugalPumpPrescriptiveOBJ.FailureModeWithLSETree = data.FailureModeWithLSETree
      this.centrifugalPumpPrescriptiveOBJ.FMWithConsequenceTree = data.FMWithConsequenceTree
      this.centrifugalPumpPrescriptiveOBJ.ComponentCriticalityFactor = data.ComponentCriticalityFactor
      this.centrifugalPumpPrescriptiveOBJ.ComponentRating = data.ComponentRating
      this.centrifugalPumpPrescriptiveOBJ.CMaintainenancePractice = data.CMaintainenancePractice
      this.centrifugalPumpPrescriptiveOBJ.CFrequencyMaintainenance = data.CFrequencyMaintainenance
      this.centrifugalPumpPrescriptiveOBJ.CConditionMonitoring = data.CConditionMonitoring
      this.centrifugalPumpPrescriptiveOBJ.CAttachmentDBPath = data.CAttachmentDBPath
      this.centrifugalPumpPrescriptiveOBJ.CAttachmentFullPath = data.CAttachmentFullPath
      this.centrifugalPumpPrescriptiveOBJ.CRemarks = data.CRemarks

      for (let index = 0; index < data.restoreCentrifugalPumpPrescriptiveFailureModes.length; index++) {
        let obj = {}
        obj['CPPFMId'] = 0;
        obj['CFPPrescriptiveId'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].CFPPrescriptiveId;
        obj['FunctionMode'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].FunctionMode;
        obj['LocalEffect'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].LocalEffect;
        obj['SystemEffect'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].SystemEffect;
        obj['Consequence'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].Consequence;
        obj['DownTimeFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].DownTimeFactor;
        obj['ScrapeFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].ScrapeFactor;
        obj['SafetyFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].SafetyFactor;
        obj['ProtectionFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].ProtectionFactor;
        obj['FrequencyFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].FrequencyFactor;
        obj['CriticalityFactor'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].CriticalityFactor;
        obj['Rating'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].Rating;
        obj['MaintainenancePractice'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].MaintainenancePractice;
        obj['FrequencyMaintainenance'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].FrequencyMaintainenance;
        obj['ConditionMonitoring'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].ConditionMonitoring;
        obj['AttachmentDBPath'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].AttachmentDBPath;
        obj['AttachmentFullPath'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].AttachmentFullPath;
        obj['Remark'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].Remark;
        obj['Pattern'] = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].Pattern;

        this.centrifugalPumpPrescriptiveOBJ.centrifugalPumpPrescriptiveFailureModes.push(obj);
      }

      this.http.post('api/PrescriptiveAPI/RestoreRecords', this.centrifugalPumpPrescriptiveOBJ)
        .subscribe(
          res => {
            this.messageService.add({ severity: 'success', summary: 'success', detail: 'Successfully Restored Records' });
            this.DeleteRecycleBinWholeTree(data.RCPPMId)
          }, err => { console.log(err) }
        )

    }

  }

  DeleteRecycleBinWholeTree(RCPPMId) {
    var RCPPMId = RCPPMId;
    var RCPFMId: any = 0
    const params = new HttpParams()
      .set("RCPPMId", RCPPMId)
      .set("RCPFMId", RCPFMId)
    this.http.delete('api/PrescriptiveAPI/DeleteRecycleWholeData', { params })
      .subscribe(
        res => {
          this.getCentrifugalPumpRecycleWholeData();
          this.messageService.add({ severity: 'success', summary: 'success', detail: 'Asset has been Removed From Recycle Bin' });
        }, err => { console.log(err.err) }
      )
  }


  Delete(data) {
    if (data.FunctionMode != undefined) {
      const params = new HttpParams()
        .set("RCPPMId", "0")
        .set("RCPFMId", data.RCPFMId)
      this.http.delete('api/PrescriptiveAPI/DeleteRecycleWholeData', { params }).subscribe(
        res => {
          this.getCentrifugalPumpRecycleChildData();
          this.messageService.add({ severity: 'success', summary: 'success', detail: 'Successfully Deleted' });
        }, err => { console.log(err.err); this.getCentrifugalPumpRecycleChildData(); }
      )


      if (data.AttachmentFullPath.length > 4) {
        const params = new HttpParams()
          .set("fullPath", data.AttachmentFullPath)

        this.http.delete('api/PrescriptiveAPI/UpdateFileUpload', { params }).subscribe()

      }

    } else {

      for (let index = 0; index < data.restoreCentrifugalPumpPrescriptiveFailureModes.length; index++) {
        var fullPath = data.restoreCentrifugalPumpPrescriptiveFailureModes[index].AttachmentFullPath
        const params = new HttpParams()
          .set("fullPath", fullPath);
        this.http.delete('api/PrescriptiveAPI/UpdateFileUpload', { params }).subscribe();
      }
      const params = new HttpParams()
        .set("RCPPMId", data.RCPPMId)
        .set("RCPFMId", "0");
      this.http.delete('api/PrescriptiveAPI/DeleteRecycleWholeData', { params })
        .subscribe((res: any) => {
          this.getCentrifugalPumpRecycleWholeData();
          this.messageService.add({ severity: 'success', summary: 'success', detail: 'Successfully Deleted' });
        }, err => { console.log(err.err) });
    }

  }



}
