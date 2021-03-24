import { HttpClient, HttpParams } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { CommonLoadingDirective } from 'src/app/shared/Loading/common-loading.directive';
import { Router } from '@angular/router';
import { CentrifugalPumpPrescriptiveModel } from './prescriptive-model'
import { CanComponentDeactivate } from 'src/app/auth.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-prescriptive-add',
  templateUrl: './prescriptive-add.component.html',
  styleUrls: ['./prescriptive-add.component.scss'],
  providers: [MessageService],
})
export class PrescriptiveAddComponent implements OnInit, CanComponentDeactivate {
  public MachineType: string = "";
  private FMCount: number = 0;
  private FMCount1: number = 0;
  private FMLSConsequenceName: string = "";
  private activeIndex: number;
  public InsertLSEffect: any;
  public failureModeDataBind: any;
  public val: any;
  public failureModeData: any = []
  public data1: TreeNode[];
  public data2: TreeNode[];
  public ConsequenceNode: TreeNode[];
  public selectedNode: TreeNode;
  public items: MenuItem[];
  public functionFailuerInput: any = [];
  public failuerModeInput: any = [];
  public failuerModeLocalEffects: string = "";
  public failuerModeSystemEffects: string = "";
  public prescriptiveTreeSubmitEnable: boolean = false;
  public prescriptiveSelect: boolean = true;
  public prescriptiveFuntion: boolean = false;
  public prescriptiveFunctionFailure: boolean = false;
  public prescriptiveFailureMode: boolean = false;
  public prescriptiveSteps: boolean = false;
  public prescriptiveTree: boolean = false;
  public prescriptiveEffect: boolean = false;
  public effectFooter: boolean = true;
  public EquipmentType: string = "";
  public EquipmentList: any = []
  public TagNumber: string = "";
  public dropDownData: any = [];
  public treeResponseData: any = [];

  public FunctionFluidType: string = "";
  public FunctionRatedHead: string = "";
  public FunctionPeriodType: string = "";

  private functionFailureData: any = [];
  private functionModeData: any = [];
  private consequenceTreeColorNodeA = 'p-person1'
  private consequenceTreeColorNodeB = 'p-person'
  private consequenceTreeColorNodeC = 'p-person'
  private consequenceTreeColorNodeD = 'p-person'
  private consequenceA;
  private consequenceB;
  private consequenceC;
  private consequenceD;
  private consequenceE;
  private finalConsequence;
  public functionfailure: any = [];
  public failuerMode: any = [];

  public dropedFailure = [];
  public dropedMode = [];

  public dragedColor = null;
  public dragedFunctionMode = null;
  public dragedFunctionfailure = null;
  public treeData: any = [];
  public prescriptiveTreeUpdateEnable: boolean = false;
  public prescriptiveTreeNextEnable: boolean = false;
  public prescriptiveTreeBackEnable: boolean = false;
  public prescriptiveEffect1: boolean = false;

  public draggedConsequencesYesNO: any = ['YES', 'NO']
  public droppedYesNo = null;
  public dropedConsequenceFailureMode = []

  public droppedYesNo1 = null;
  public dropedConsequenceEffectFailureMode = []

  public droppedYesNo2 = null;
  public dropedConsequenceCombinationFailureMode = []
  public droppedYesNo3 = null;
  public dropedConsequenceAffectFailureMode = []
  public ADDFailureLSEDiasble: boolean = false;
  public NextFailureLSEDiasble: boolean = false;
  public Consequences1: boolean = false;
  public Consequences2: boolean = false;
  public Consequences3: boolean = false;
  public Consequences4: boolean = false;
  public ConsequencesTree: boolean = false;
  public SaveConcequencesEnable: boolean = false;
  public ConsequencesAnswer: any = [];
  public FMChild = []
  public FMLSEffectModeName: string = ""

  public DownTimeFactor: number = 0;
  public ScrapeFactor: number = 0;
  public SafetyFactor: number = 0;
  public ProtectionFactor: number = 0;
  public FrequencyFactor: number = 0;
  private FactoryToAddInFM: any = []
  public fullPath: string = ""
  public fileUpload: string = "";
  public dbPath: string = "";
  public Remark: string = "";
  public FileId: string = "";
  public fileAttachmentEnable: boolean = false;
  public centrifugalPumpPrescriptiveOBJ: CentrifugalPumpPrescriptiveModel = new CentrifugalPumpPrescriptiveModel();
  public selectedModeData: any;

  constructor(private messageService: MessageService,
    public formBuilder: FormBuilder,
    public title: Title,
    public router: Router,
    public commonLoadingDirective: CommonLoadingDirective,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef) { }

  private isNewEntity: boolean = false;
  CanDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (this.isNewEntity) {
      if (confirm('Are you sure you want to go back. You have have pending changes')) {
        if (this.MachineType.length > 2) {
          this.treeSave()
        } else if (this.SaveConcequencesEnable == true) {
          this.SaveConsequences();
        }
        return true;
      } else {
        return true;
      };
    } else {
      return true;
    }
  };

  ngOnInit() {
    this.title.setTitle('DPM | Prescriptive ');
    setInterval(() => {
      this.dynamicDroppedPopup();
    }, 2000);

    this.items = [{
      styleClass: 'p-person',
      expanded: true,
      label: 'Function',
      command: (event: any) => {
        this.activeIndex = 0;
      }
    },
    {
      label: 'Function Failure',

      command: (event: any) => {
        this.activeIndex = 1;

      }
    },
    {
      label: 'Failure Mode',
      command: (event: any) => {
        this.activeIndex = 2;
      }
    },
    {
      label: 'Effects',
      command: (event: any) => {
        this.activeIndex = 3;
      }
    },

    {
      label: 'Tree',
      command: (event: any) => {
        this.activeIndex = 4;

      }
    },

    {
      label: 'Consequences',
      command: (event: any) => {
        this.activeIndex = 5;

      }
    }

    ];
  }

  async ngOnDestroy() {
    await localStorage.removeItem('PrescriptiveObject');
  }
  public uploadedAttachmentList: any[] = [];
  public uploadFile(event) {
    if (event.target.files.length > 0) {
      if (event.target.files[0].type === 'application/pdf'
        || event.target.files[0].type === 'image/png'
        || event.target.files[0].type === 'image/jpeg') {
        let filedata = this.uploadedAttachmentList.find(a => a.FileId === this.FileId);
        let fileToUpload = event.target.files[0];
        const formData = new FormData();
        formData.append('file', fileToUpload, fileToUpload.name);
        formData.append('removePath', !!filedata ? filedata.dbPath : "");
        this.fileUpload = fileToUpload.name;
        this.http.post('api/PrescriptiveAPI/UploadFile', formData)
          .subscribe((res: any) => {
            this.dbPath = res.dbPath;
            this.fullPath = res.fullPath;
            this.fileUpload = res.fileName;
            this.FileId = res.FileId;
            this.uploadedAttachmentList.push(res)
            this.fileAttachmentEnable = true;
          }, err => { console.log(err.err) });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: "Only Pdf's and Images are allowed" })
      }
    }
  }



  CloseAttachmentModal() {
    if (this.fullPath.length > 4) {
      const params = new HttpParams()
        .set("fullPath", this.fullPath)
      this.http.delete('api/PrescriptiveAPI/UpdateFileUpload', { params }).subscribe(
        res => {
          this.fileUpload = ""
          this.fileAttachmentEnable = false
        }
      )
    }

  }

  AttachmentDoneModal() {
    this.fileAttachmentEnable = false;
    this.fileUpload = ""
  }

  dynamicDroppedPopup() {
    //faliure droped popup
    if (this.dropedFailure.length > 1) {
      for (let index = 0; index < this.dropedFailure.length - 1; index++) {
        var elementIndex = this.dropedFailure[this.dropedFailure.length];
        this.dropedFailure.splice(elementIndex, 1)

      }

    }
    if (this.dropedConsequenceFailureMode.length > 1) {
      for (let index = 0; index < this.dropedConsequenceFailureMode.length - 1; index++) {
        var elementIndex = this.dropedConsequenceFailureMode[this.dropedConsequenceFailureMode.length];
        this.dropedConsequenceFailureMode.splice(elementIndex, 1)

      }

    }

    if (this.dropedConsequenceEffectFailureMode.length > 1) {
      for (let index = 0; index < this.dropedConsequenceEffectFailureMode.length - 1; index++) {
        var elementIndex = this.dropedConsequenceEffectFailureMode[this.dropedConsequenceEffectFailureMode.length];
        this.dropedConsequenceEffectFailureMode.splice(elementIndex, 1)

      }

    }
    if (this.dropedConsequenceCombinationFailureMode.length > 1) {
      for (let index = 0; index < this.dropedConsequenceCombinationFailureMode.length - 1; index++) {
        var elementIndex = this.dropedConsequenceCombinationFailureMode[this.dropedConsequenceCombinationFailureMode.length];
        this.dropedConsequenceCombinationFailureMode.splice(elementIndex, 1)

      }

    }
    if (this.dropedConsequenceAffectFailureMode.length > 1) {
      for (let index = 0; index < this.dropedConsequenceAffectFailureMode.length - 1; index++) {
        var elementIndex = this.dropedConsequenceAffectFailureMode[this.dropedConsequenceAffectFailureMode.length];
        this.dropedConsequenceAffectFailureMode.splice(elementIndex, 1)

      }

    }


  }

  MachineEquipmentSelect(event) {
    if (this.MachineType == "Pump") {
      this.EquipmentList = null
      this.EquipmentList = ["Centrifugal Pump"]
    }
    if (this.MachineType == "Compressor") {
      this.EquipmentList = null
      this.EquipmentList = ["Compressor"]
    }
    console.log(this.EquipmentType)
  }


  getDropDownLookMasterData() {
    const params = new HttpParams()
      .set('MachineType', this.MachineType)
      .set('EquipmentType', this.EquipmentType)

    this.http.get('api/PrescriptiveLookupMasterAPI/GetRecords', { params }).subscribe(
      res => {
        console.log(res)
        this.dropDownData = res;

        this.dropDownData.forEach(element => {
          if (element.Function == "Function Failure") {
            this.functionFailureData.push(element)
          } else if (element.Function == "Function Mode") {
            this.functionModeData.push(element)
          }

        });
        console.log(this.functionFailureData)
        console.log(this.functionModeData)

        this.functionfailure = this.functionFailureData;
        this.failuerMode = this.functionModeData;
      })
  }



  GeneratePrescription() {
    if (this.EquipmentType.length > 0 && this.TagNumber.length > 0) {
      this.getDropDownLookMasterData();
      this.prescriptiveSelect = false;
      this.prescriptiveSteps = true;
      this.prescriptiveFuntion = true;
      this.prescriptiveFunctionFailure = false;
      this.prescriptiveFailureMode = false;
      this.prescriptiveEffect = false;
      this.prescriptiveEffect1 = false
      this.prescriptiveTree = false;
      this.activeIndex = 0;
    } else if (this.EquipmentType.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Equipment Type is missing' });

    } else if (this.TagNumber.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'TagNumber is missing' });
    }
  }

  FunctionNext() {
    if (this.FunctionFluidType.length > 0 && this.FunctionRatedHead.length > 0 && this.FunctionPeriodType.length > 0) {
      this.prescriptiveFuntion = false;
      this.prescriptiveFunctionFailure = true;
      this.activeIndex = 1;

    } else if (this.FunctionFluidType.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'FluidType is missing' });

    } else if (this.FunctionRatedHead.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'RatedHead is missing' });

    } else if (this.FunctionPeriodType.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'PeriodType is missing' });

    }
  }

  FunctionFailuerInput(e) {
    this.dropedFailure.pop();
    this.dropedFailure.push(this.functionFailuerInput);

  }
  FunctionFailureBack() {
    this.prescriptiveFuntion = true;
    this.prescriptiveFunctionFailure = false;
    this.activeIndex = 0;
  }
  FunctionFailureNext() {
    if (this.dropedFailure.length > 0) {
      this.functionFailuerInput = []
    }
    if (this.dropedFailure.length > 0 && this.functionFailuerInput.length > 1) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Data overloaded on both fields, please select any one option' });
    } else if (this.dropedFailure.length == 0 && this.functionFailuerInput.length > 0) {
      this.prescriptiveFunctionFailure = false;
      this.prescriptiveFailureMode = true;
      this.activeIndex = 2;

    } else if (this.dropedFailure.length > 0 && this.functionFailuerInput.length == 0) {
      this.prescriptiveFunctionFailure = false;
      this.prescriptiveFailureMode = true;
      this.activeIndex = 2;

    } else if (this.dropedFailure.length == 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Please Add Function failure' });
    } else if (this.dropedFailure.length == 1) {
      this.prescriptiveFunctionFailure = false;
      this.prescriptiveFailureMode = true;
      this.activeIndex = 2;
    }
  }

  FailuerModeInput($event) {
    this.dropedMode.pop();
    this.dropedMode.push(this.failuerModeInput);

  }

  FailureModeBack() {
    this.prescriptiveFunctionFailure = true;
    this.prescriptiveFailureMode = false;
    this.activeIndex = 1;
  }


  GenrationTree() {
    var funFailure;
    if (this.dropedFailure[0].Description == undefined) {
      funFailure = this.dropedFailure[0]
    } else {
      funFailure = this.dropedFailure[0].Description
    }


    this.data1 = [
      {
        label: "Function",
        type: "person",
        styleClass: "p-person",
        expanded: true,
        data: { name: "Fluid Type : " + this.FunctionFluidType + ", " + "Rated Head : " + this.FunctionRatedHead + " m " + ", " + "Duration Of : " + this.FunctionPeriodType + " days" },
        children: [
          {
            label: "Function Failure",
            type: "person",
            styleClass: "p-person",
            expanded: true,
            data: { name: funFailure },
            children: this.InsertLSEffect
          }
        ]
      }
    ];

  }

  FailureModeDropped(c) {
    var findIndexOF = c.PrescriptiveLookupMasterId
    var index = -1;
    var filteredObj = this.dropedMode.find(function (item, i) {
      if (item.PrescriptiveLookupMasterId === findIndexOF) {
        index = i;
        return i;
      }
    });

    this.dropedMode.splice(index, 1)
  }

  FailureModeNext() {
    if (this.dropedMode.length > 0) {
      this.FMChild = []
      this.FactoryToAddInFM = []
      this.NextFailureLSEDiasble = false

      var Data = [], FMName
      this.dropedMode.forEach(element => {
        Data.push(element.Description)
      });
      for (let index = 0; index < Data.length; index++) {
        FMName = Data[index]
        this.FMChild.push(
          {
            label: index + 1,
            type: "person",
            styleClass: "p-person",
            expanded: true,
            data: { name: FMName },
            children: []
          }
        )
      }

      this.prescriptiveEffect = true
      this.prescriptiveEffect1 = true
      this.prescriptiveFailureMode = false;
      this.activeIndex = 3
      this.FMCount = 0;

      this.InsertLSEffect = [
        {
          label: "Failure Mode",
          styleClass: "department-cto",
          expanded: true,
          children: this.FMChild
        }
      ]
      this.ADDFailureLSEDiasble = true
      this.FMLSEffectModeName = this.FMChild[this.FMCount].data.name
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Please Add Failure Modes' });
    }
  }
  ADDFailuerEffect() {
    //&& this.dbPath.length > 0 
    if (this.failuerModeLocalEffects !== ''
      && this.failuerModeSystemEffects !== '' && this.DownTimeFactor !== 0
      && this.ScrapeFactor !== 0 && this.SafetyFactor !== 0
      && this.ProtectionFactor !== 0 && this.FrequencyFactor !== 0) {

      let LFNode = {
        label: "Local Effect",
        type: "person",
        styleClass: "p-person",
        expanded: true,
        data: {
          name: this.failuerModeLocalEffects
        }
      }
      let SFNode = {
        label: "System Effect",
        type: "person",
        styleClass: "p-person",
        expanded: true,
        data: {
          name: this.failuerModeSystemEffects
        }
      }
      this.changeDetectorRef.detectChanges();
      this.FMChild[this.FMCount].children.push(LFNode);
      this.FMChild[this.FMCount].children.push(SFNode);
      let obj = {}
      obj['DownTimeFactor'] = this.DownTimeFactor;
      obj['ScrapeFactor'] = this.ScrapeFactor;
      obj['SafetyFactor'] = this.SafetyFactor;
      obj['ProtectionFactor'] = this.ProtectionFactor;
      obj['FrequencyFactor'] = this.FrequencyFactor;
      obj['AttachmentDBPath'] = this.dbPath;
      obj['AttachmentFullPath'] = this.fullPath;
      obj['Remark'] = this.Remark;
      obj['FileId'] = this.FileId;
      obj['fileName'] = this.fileUpload;

      this.FactoryToAddInFM.push(obj)
      if (this.FMCount == this.FMChild.length - 1) {
        this.ADDFailureLSEDiasble = false;
        this.FMLSEffectModeName = ""
        this.NextFailureLSEDiasble = true;
        this.ADDFailureLSEDiasble = false;
        this.prescriptiveEffect = false
        this.FMLSConsequenceName = this.FMChild[this.FMCount1].data.name
      }
      this.onLSEffectAddedUpdateMessage(this.FMChild[this.FMCount], 'Added');
      this.failuerModeLocalEffects = ""
      this.failuerModeSystemEffects = ""
      this.DownTimeFactor = 0
      this.ScrapeFactor = 0
      this.SafetyFactor = 0
      this.ProtectionFactor = 0
      this.FrequencyFactor = 0
      this.FMCount += 1;
      if (this.FMCount <= this.FMChild.length - 1) {
        this.FMLSEffectModeName = this.FMChild[this.FMCount].data.name
      }
      this.dbPath = "";
      this.fullPath = "";
      this.Remark = "";
      this.fileUpload = "";
      this.FileId = "";
    } else {
      this.messageService.add({ severity: 'info', summary: 'info', detail: 'Please fill all Fields' });
    }

  }

  UPDATEFailuerEffect() {
    this.ADDFailureLSEDiasble = true;
    this.selectedModeData.children[0].data.name = this.failuerModeLocalEffects;
    this.selectedModeData.children[1].data.name = this.failuerModeSystemEffects;
    let obj = {}
    obj['DownTimeFactor'] = this.DownTimeFactor;
    obj['ScrapeFactor'] = this.ScrapeFactor
    obj['SafetyFactor'] = this.SafetyFactor
    obj['ProtectionFactor'] = this.ProtectionFactor
    obj['FrequencyFactor'] = this.FrequencyFactor
    obj['AttachmentDBPath'] = this.dbPath
    obj['AttachmentFullPath'] = this.fullPath
    obj['Remark'] = this.Remark;
    obj['FileId'] = this.FileId;
    obj['fileName'] = this.fileUpload;

    this.FactoryToAddInFM[this.selectedModeData.label - 1] = obj;
    if (this.selectedModeData.label - 1 == this.FMChild.length - 1) {
      this.ADDFailureLSEDiasble = false;
      this.FMLSEffectModeName = ""
      this.NextFailureLSEDiasble = true;
      this.ADDFailureLSEDiasble = false;
      this.prescriptiveEffect = false
      this.FMLSConsequenceName = this.FMChild[this.FMCount1].data.name
    }
    this.onLSEffectAddedUpdateMessage(this.FMChild[this.selectedModeData.label - 1], 'Updated');
    this.failuerModeLocalEffects = "";
    this.failuerModeSystemEffects = "";
    this.DownTimeFactor = 0;
    this.ScrapeFactor = 0;
    this.SafetyFactor = 0;
    this.ProtectionFactor = 0;
    this.FrequencyFactor = 0;
    if (this.selectedModeData.label <= this.FMChild.length - 1) {
      this.FMLSEffectModeName = this.FMChild[this.selectedModeData.label].data.name;
    }
    let isCheck = false;
    this.FMChild.forEach(row => {
      if (row.children.length > 0) {
        isCheck = true;
      } else {
        isCheck = false;
      }
    });
    if (isCheck) {
      this.prescriptiveEffect = false;
    }
    this.dbPath = "";
    this.fullPath = "";
    this.Remark = "";
    this.fileUpload = "";
    this.FileId = "";
  }

  SaveConsequences() {
    this.isNewEntity = false
    this.centrifugalPumpPrescriptiveOBJ.centrifugalPumpPrescriptiveFailureModes = []
    this.centrifugalPumpPrescriptiveOBJ.CFPPrescriptiveId = this.treeResponseData.CFPPrescriptiveId;
    this.centrifugalPumpPrescriptiveOBJ.FMWithConsequenceTree = JSON.stringify(this.data1);
    for (let index = 0; index < this.FMChild.length; index++) {
      let obj = {};
      obj['CPPFMId'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].CPPFMId;
      obj['CFPPrescriptiveId'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].CFPPrescriptiveId;
      obj['FunctionMode'] = this.FMChild[index].data.name;
      obj['LocalEffect'] = this.FMChild[index].children[0].data.name;
      obj['SystemEffect'] = this.FMChild[index].children[1].data.name;
      obj['Consequence'] = this.FMChild[index].children[2].data.name;
      obj['DownTimeFactor'] = this.FactoryToAddInFM[index].DownTimeFactor
      obj['ScrapeFactor'] = this.FactoryToAddInFM[index].ScrapeFactor
      obj['SafetyFactor'] = this.FactoryToAddInFM[index].SafetyFactor
      obj['ProtectionFactor'] = this.FactoryToAddInFM[index].ProtectionFactor
      obj['FrequencyFactor'] = this.FactoryToAddInFM[index].FrequencyFactor
      obj['CriticalityFactor'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].CriticalityFactor;
      obj['Rating'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].Rating;
      obj['MaintainenancePractice'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].MaintainenancePractice;
      obj['FrequencyMaintainenance'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].FrequencyMaintainenance;
      obj['ConditionMonitoring'] = this.treeResponseData.centrifugalPumpPrescriptiveFailureModes[index].ConditionMonitoring;
      obj['AttachmentDBPath'] = this.FactoryToAddInFM[index].AttachmentDBPath
      obj['AttachmentFullPath'] = this.FactoryToAddInFM[index].AttachmentFullPath
      obj['Remark'] = this.FactoryToAddInFM[index].Remark
      this.centrifugalPumpPrescriptiveOBJ.centrifugalPumpPrescriptiveFailureModes.push(obj)
    }

    this.http.put('api/PrescriptiveAPI/CFPrescriptiveAdd', this.centrifugalPumpPrescriptiveOBJ).subscribe(
      res => {
        console.log(res);
        this.messageService.add({ severity: 'success', summary: 'Sucess', detail: 'Successfully Done' });
        this.router.navigateByUrl('/Home/Dashboard');
      }, err => { console.log(err.err) }
    )

  }

  treeSave() {
    this.isNewEntity = false;
    this.prescriptiveTreeBackEnable = false
    this.centrifugalPumpPrescriptiveOBJ.MachineType = this.MachineType
    this.MachineType = "";
    this.isNewEntity = false;
    this.centrifugalPumpPrescriptiveOBJ.EquipmentType = this.EquipmentType
    this.centrifugalPumpPrescriptiveOBJ.TagNumber = this.TagNumber
    this.centrifugalPumpPrescriptiveOBJ.FunctionFluidType = this.FunctionFluidType
    this.centrifugalPumpPrescriptiveOBJ.FunctionRatedHead = this.FunctionRatedHead
    this.centrifugalPumpPrescriptiveOBJ.FunctionPeriodType = this.FunctionPeriodType
    this.centrifugalPumpPrescriptiveOBJ.FunctionFailure = this.dropedFailure[0].Description
    this.centrifugalPumpPrescriptiveOBJ.FailureModeWithLSETree = JSON.stringify(this.data1)

    for (let index = 0; index < this.FMChild.length; index++) {
      let obj = {};
      obj['CPPFMId'] = 0;
      obj['CFPPrescriptiveId'] = 0;
      obj['FunctionMode'] = this.FMChild[index].data.name;
      obj['LocalEffect'] = this.FMChild[index].children[0].data.name;
      obj['SystemEffect'] = this.FMChild[index].children[1].data.name;
      obj['Consequence'] = "";
      obj['DownTimeFactor'] = this.FactoryToAddInFM[index].DownTimeFactor
      obj['ScrapeFactor'] = this.FactoryToAddInFM[index].ScrapeFactor
      obj['SafetyFactor'] = this.FactoryToAddInFM[index].SafetyFactor
      obj['ProtectionFactor'] = this.FactoryToAddInFM[index].ProtectionFactor
      obj['FrequencyFactor'] = this.FactoryToAddInFM[index].FrequencyFactor
      obj['AttachmentDBPath'] = this.FactoryToAddInFM[index].AttachmentDBPath
      obj['AttachmentFullPath'] = this.FactoryToAddInFM[index].AttachmentFullPath
      obj['Remark'] = this.FactoryToAddInFM[index].Remark
      this.centrifugalPumpPrescriptiveOBJ.centrifugalPumpPrescriptiveFailureModes.push(obj)

    }


    this.http.post('api/PrescriptiveAPI/PostCentrifugalPumpPrescriptiveData', this.centrifugalPumpPrescriptiveOBJ).subscribe(
      res => {
        console.log(res);
        this.treeResponseData = res;
        localStorage.setItem('PrescriptiveObject', JSON.stringify(this.treeResponseData))
        this.prescriptiveTreeNextEnable = true
        this.prescriptiveTreeUpdateEnable = false;
        this.prescriptiveTreeSubmitEnable = false;
        this.prescriptiveTreeBackEnable = false

      },
      err => { console.log(err.Message) }
    )


  }

  PushConcequences() {
    this.FMChild[this.FMCount1].children.push(
      {
        label: "Consequence",
        type: "person",
        styleClass: "p-person",
        expanded: true,
        data: {
          name: this.finalConsequence
        }
      }
    )
    this.FMCount1 += 1;
    if (this.FMCount1 <= this.FMChild.length - 1) {
      this.FMLSConsequenceName = this.FMChild[this.FMCount1].data.name
    }
    if (this.FMCount1 == this.FMChild.length) {
      this.prescriptiveTreeNextEnable = false;
      this.SaveConcequencesEnable = true;
      this.isNewEntity = true
    }

    this.activeIndex = 4
    this.prescriptiveTree = true;
    this.Consequences1 = false;
    this.ConsequencesTree = false;
    this.dropedConsequenceEffectFailureMode = []
    this.dropedConsequenceFailureMode = []
    this.dropedConsequenceCombinationFailureMode = []
    this.dropedConsequenceAffectFailureMode = []
    this.ConsequenceNode = []
    this.consequenceA = 'p-person1'
    this.consequenceB = 'p-person'
    this.consequenceC = 'p-person'
    this.consequenceD = 'p-person'
    this.consequenceE = 'p-person'

    this.consequenceTreeColorNodeA = 'p-person1'
    this.consequenceTreeColorNodeB = 'p-person'
    this.consequenceTreeColorNodeC = 'p-person'
    this.consequenceTreeColorNodeD = 'p-person'

  }



  FailureEffectNext() {
    this.prescriptiveFailureMode = false;
    this.prescriptiveEffect = false;
    this.prescriptiveEffect1 = false
    this.prescriptiveTree = true;
    this.prescriptiveTreeBackEnable = true
    this.activeIndex = 4;
    var SubmitedTree = JSON.parse(localStorage.getItem('PrescriptiveObject'))
    if (SubmitedTree == null) {
      this.prescriptiveTreeSubmitEnable = true;
    }

    this.isNewEntity = true
    this.GenrationTree()

  }
  FailuerEffectBack() {
    if (this.FMChild[0].children.length > 0) {
      if (confirm("Are you sure want to go back? Yes then your recently added changes will get deleted.")) {
        this.prescriptiveEffect = false;
        this.prescriptiveEffect1 = false
        this.prescriptiveFailureMode = true;
        this.activeIndex = 2;
        this.failuerModeLocalEffects = "";
        this.failuerModeSystemEffects = "";
        this.DownTimeFactor = 0;
        this.ScrapeFactor = 0;
        this.SafetyFactor = 0;
        this.ProtectionFactor = 0;
        this.FrequencyFactor = 0;
        this.prescriptiveEffect = false;
        this.ADDFailureLSEDiasble = true;
        this.selectedModeData = "";
        this.fullPath = "";
        this.Remark = "";
        this.dbPath = "";
        this.fileUpload = "";
      }
    } else {
      this.prescriptiveEffect = false;
      this.prescriptiveEffect1 = false
      this.prescriptiveFailureMode = true;
      this.activeIndex = 2;
    }
  }

  treeBack() {
    this.prescriptiveEffect = true;
    this.prescriptiveEffect1 = true
    this.prescriptiveTree = false;

  }

  treeNext() {
    this.prescriptiveTree = true;
    this.Consequences1 = true;
    this.activeIndex = 5
  }


  Consequence1Back() {
    this.activeIndex = 4
    this.prescriptiveTree = true;
    this.Consequences1 = false;
  }
  Consequence1Next() {
    if (this.dropedConsequenceFailureMode.length == 1) {
      if (this.dropedConsequenceFailureMode[0] == 'YES') {
        this.ConsequencesAnswer.push(this.dropedConsequenceFailureMode[0])
        console.log(this.ConsequencesAnswer)
        this.Consequences2 = true;
        this.Consequences1 = false;
        this.Consequences3 = false;
        this.Consequences4 = false;
      } else {
        this.ConsequencesAnswer.push(this.dropedConsequenceFailureMode[0])
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = true;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
      }
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Field is Empty, Drag and drop inside field' });
    }


  }
  Consequence2Back() {
    this.Consequences1 = true;
    this.Consequences2 = false;

  }
  Consequence2Next() {
    if (this.dropedConsequenceEffectFailureMode.length == 1) {
      if (this.dropedConsequenceEffectFailureMode[0] == 'YES') {
        this.ConsequencesAnswer.push(this.dropedConsequenceEffectFailureMode[0])
        this.consequenceA = 'p-person'
        this.consequenceB = 'p-person1'
        this.consequenceC = 'p-person'
        this.consequenceD = 'p-person'
        this.consequenceE = 'p-person'
        this.finalConsequence = ""
        this.finalConsequence = "B"
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
        this.ConsequencesTree = true;
        this.colorConsequenceTree()
      } else {
        this.ConsequencesAnswer.push(this.dropedConsequenceEffectFailureMode[0])
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = true;
      }
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Field is Empty, Drag and drop inside field' });
    }

  }
  Consequence3Back() {
    this.Consequences1 = true
    this.Consequences3 = false;
  }
  Consequence3Next() {
    if (this.dropedConsequenceCombinationFailureMode.length == 1) {
      if (this.dropedConsequenceCombinationFailureMode[0] == 'YES') {
        this.ConsequencesAnswer.push(this.dropedConsequenceCombinationFailureMode[0])
        this.finalConsequence = ""
        this.finalConsequence = "A"
        this.consequenceA = 'p-person1'
        this.consequenceB = 'p-person'
        this.consequenceC = 'p-person'
        this.consequenceD = 'p-person'
        this.consequenceE = 'p-person'
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
        this.ConsequencesTree = true;
        this.colorConsequenceTree()
      } else {
        this.ConsequencesAnswer.push(this.dropedConsequenceCombinationFailureMode[0])
        this.finalConsequence = ""
        this.finalConsequence = "E"
        this.consequenceA = 'p-person'
        this.consequenceB = 'p-person'
        this.consequenceC = 'p-person'
        this.consequenceD = 'p-person'
        this.consequenceE = 'p-person1'
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
        this.ConsequencesTree = true;
        this.colorConsequenceTree()
      }
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Field is Empty, Drag and drop inside field' });
    }

  }
  Consequence4Back() {
    this.Consequences2 = true
    this.Consequences4 = false;
  }
  Consequence4Next() {
    if (this.dropedConsequenceAffectFailureMode.length == 1) {
      if (this.dropedConsequenceAffectFailureMode[0] == 'YES') {
        this.ConsequencesAnswer.push(this.dropedConsequenceAffectFailureMode[0])
        this.finalConsequence = ""
        this.finalConsequence = "C"
        this.consequenceA = 'p-person'
        this.consequenceB = 'p-person'
        this.consequenceC = 'p-person1'
        this.consequenceD = 'p-person'
        this.consequenceE = 'p-person'
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
        this.ConsequencesTree = true;
        this.colorConsequenceTree()
      } else {
        this.ConsequencesAnswer.push(this.dropedConsequenceAffectFailureMode[0])
        this.finalConsequence = ""
        this.finalConsequence = "D"
        this.consequenceA = 'p-person'
        this.consequenceB = 'p-person'
        this.consequenceC = 'p-person'
        this.consequenceD = 'p-person1'
        this.consequenceE = 'p-person'
        console.log(this.ConsequencesAnswer)
        this.Consequences3 = false;
        this.Consequences2 = false;
        this.Consequences1 = false;
        this.Consequences4 = false;
        this.ConsequencesTree = true;
        this.colorConsequenceTree()
      }
    } else {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Field is Empty, Drag and drop inside field' });
    }

  }

  ConsequenceTreeBack() {
    this.dropedConsequenceAffectFailureMode = [];
    this.dropedConsequenceCombinationFailureMode = [];
    this.dropedConsequenceFailureMode = [];
    this.dropedConsequenceEffectFailureMode = [];
    this.ConsequencesTree = false
    this.Consequences1 = true;
    this.consequenceA = 'p-person'
    this.consequenceB = 'p-person'
    this.consequenceC = 'p-person'
    this.consequenceD = 'p-person'
    this.consequenceE = 'p-person'
    this.consequenceTreeColorNodeA = 'p-person1'
    this.consequenceTreeColorNodeB = 'p-person'
    this.consequenceTreeColorNodeC = 'p-person'
    this.consequenceTreeColorNodeD = 'p-person'
  }

  colorConsequenceTree() {
    if (this.ConsequencesAnswer[0] == 'YES') {
      this.consequenceTreeColorNodeB = 'p-person1'
    }
    else {
      this.consequenceTreeColorNodeC = 'p-person1'
    }
    if (this.ConsequencesAnswer[0] == 'YES' && this.ConsequencesAnswer[1] == 'NO') {
      this.consequenceTreeColorNodeD = 'p-person1'
    }
    this.ConsequenceTreeGeneration();
    this.ConsequencesAnswer = [];
    this.changeDetectorRef.detectChanges();
  }


  ConsequenceTreeGeneration() {
    this.ConsequenceNode = [
      {
        label: "Consequences",
        type: "person",
        styleClass: this.consequenceTreeColorNodeA,
        expanded: true,
        data: {
          name:
            "Will the occurance of the failuer mode be evidient to operational stuff during normal operation of the plant?"
        },
        children: [
          {
            label: "Yes",
            type: "person",
            styleClass: this.consequenceTreeColorNodeB,
            expanded: true,
            data: {
              name:
                "Does the effect of the failure mode(or the secondary effect resulting from the failuer) have direct adverse effect on operational safety or the environment?"
            },
            children: [
              {
                label: "Yes",
                type: "person",
                styleClass: this.consequenceB,
                expanded: true,
                data: {
                  name: "B"
                }
              },
              {
                label: "No",
                type: "person",
                styleClass: this.consequenceTreeColorNodeD,
                expanded: true,
                data: {
                  name:
                    "Does the Failure mode adversily affect operational capabilities of the plant? "
                },
                children: [
                  {
                    label: "Yes",
                    type: "person",
                    styleClass: this.consequenceC,
                    expanded: true,
                    data: {
                      name: "C"
                    }
                  },
                  {
                    label: "No",
                    type: "person",
                    styleClass: this.consequenceD,
                    expanded: true,
                    data: {
                      name: "D"
                    }
                  }
                ]
              }
            ]
          },

          {
            label: "No",
            type: "person",
            styleClass: this.consequenceTreeColorNodeC,
            expanded: true,
            data: {
              name:
                "Does the combination of the failure mode and one additonal failure or event result in an adverse effect safety of the environment?  "
            },
            children: [
              {
                label: "Yes",
                type: "person",
                styleClass: this.consequenceA,
                expanded: true,
                data: {
                  name: "A "
                }
              },
              {
                label: "No",
                type: "person",
                styleClass: this.consequenceE,
                expanded: true,
                data: {
                  name: "E"
                }
              }
            ]
          }
        ]
      }
    ];
  }

  dragStart(e, f) {
    this.dragedFunctionfailure = f;
  }
  dragStart1(e, c) {
    this.dragedFunctionMode = c;
  }
  dragEnd(e) { }
  dragEnd1(e) { }
  drop(e) {
    if (this.dragedFunctionfailure) {
      this.dropedFailure.push(this.dragedFunctionfailure);
      this.dragedFunctionfailure = null;
    }
  }
  drop1(e) {
    if (this.dragedFunctionMode) {
      this.dropedMode.push(this.dragedFunctionMode);
      this.dragedFunctionMode = null;
    }
  }


  dragStartC1(e, con1) {
    this.droppedYesNo = con1;
  }

  dragEndC1(e) { }
  dropC1(e) {
    if (this.droppedYesNo) {
      this.dropedConsequenceFailureMode = [];
      this.dropedConsequenceFailureMode.push(this.droppedYesNo);
      this.droppedYesNo = null;
    }
  }
  dragStartC2(e, con2) {
    this.droppedYesNo1 = con2;
  }

  dragEndC2(e) { }
  dropC2(e) {
    if (this.droppedYesNo1) {
      this.dropedConsequenceEffectFailureMode = [];
      this.dropedConsequenceEffectFailureMode.push(this.droppedYesNo1);
      this.droppedYesNo1 = null;
    }
  }

  dragStartC3(e, con3) {
    this.droppedYesNo2 = con3;
  }

  dragEndC3(e) { }
  dropC3(e) {
    if (this.droppedYesNo2) {
      this.dropedConsequenceCombinationFailureMode = [];
      this.dropedConsequenceCombinationFailureMode.push(this.droppedYesNo2);
      this.droppedYesNo2 = null;
    }
  }

  dragStartC4(e, con4) {
    this.droppedYesNo3 = con4;
  }

  dragEndC4(e) { }

  dropC4(e) {
    if (this.droppedYesNo3) {
      this.dropedConsequenceAffectFailureMode = [];
      this.dropedConsequenceAffectFailureMode.push(this.droppedYesNo3);
      this.droppedYesNo3 = null;
    }
  }

  onLSEffectAddedUpdateMessage(event, type) {
    this.messageService.add({
      severity: "success",
      summary: `${type} Local and System Effect `,
      detail: `${event.data.name} to local`
    });
  }

  onNodeSelect(event) {
    if (event.node.children.length > 0) {
      this.failuerModeLocalEffects = event.node.children[0].data.name;
      this.failuerModeSystemEffects = event.node.children[1].data.name;
      this.DownTimeFactor = this.FactoryToAddInFM[event.node.label - 1].DownTimeFactor;
      this.ScrapeFactor = this.FactoryToAddInFM[event.node.label - 1].ScrapeFactor;
      this.SafetyFactor = this.FactoryToAddInFM[event.node.label - 1].SafetyFactor;
      this.ProtectionFactor = this.FactoryToAddInFM[event.node.label - 1].ProtectionFactor;
      this.FrequencyFactor = this.FactoryToAddInFM[event.node.label - 1].FrequencyFactor;
      this.dbPath = this.FactoryToAddInFM[event.node.label - 1].AttachmentDBPath;
      this.Remark = this.FactoryToAddInFM[event.node.label - 1].Remark;
      this.fullPath = this.FactoryToAddInFM[event.node.label - 1].AttachmentFullPath;
      this.fileUpload = this.FactoryToAddInFM[event.node.label - 1].fileName;
      this.FileId = this.FactoryToAddInFM[event.node.label - 1].FileId;
      this.FMLSEffectModeName = this.FMChild[event.node.label - 1].data.name
      this.prescriptiveEffect = true;
      this.ADDFailureLSEDiasble = false;
      this.selectedModeData = event.node;
    } else {
      this.messageService.add({
        severity: "info",
        summary: "Note",
        detail: "Record Found! Please add."
      });
    }
  }
}


