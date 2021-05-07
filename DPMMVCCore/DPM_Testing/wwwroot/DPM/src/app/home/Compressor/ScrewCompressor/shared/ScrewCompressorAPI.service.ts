import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class SCConstantsAPI{

  public ADDRuleAPI : string = '/ScrewCompressorConfigurationAPI';
  public getPredictedList : string = '/ScrewCompressureAPI/GetPrediction';
  public getPredictionById : string = '/ScrewCompressureAPI/GetPredictionById';
  public PredictionData : string = '/ScrewCompressureAPI/Prediction';
  public Prediction : string = '/ScrewCompressureAPI/PredictionObj';
  public FuturePrediction : string = '/ScrewCompressorFuturePredictionAPI/FuturePredictionMovingAverage';
  public getFuturePredictionRecords : string = '/ScrewCompressorFuturePredictionAPI/GetFuturePredictionRecords';
  public FuturePredictionDates : string = '/ScrewCompressorFuturePredictionAPI/FuturePredictionMonth';
  public getTrainList : string = '/ScrewCompressureAPI';
  public UploadCSV : string = '/ScrewCompressureAPI/UploadCSV';
  public TrainAddData : string = '/ScrewCompressureAPI/Configuration';
  public ChangeInConfiguration : string = '/ScrewCompressureAPI/ConfigurationChange';


  //#region  Dashboard ScrewCompressureAPI

  public ScrewTrainPreviousMonthList : string = '/ScrewCompressorTrainChartAPI/ScrewTrainPreviousMonth'
    public ScrewTrainLastUploadList : string = '/ScrewCompressorTrainChartAPI/ScrewTrainLastUpload'
    public ScrewTrainPreviousWeek : string = '/ScrewCompressorTrainChartAPI/GetPreviousWeek'
    public ScrewCompressorDataList : string = '/ScrewCompressureAPI'
    public PredictionDataList : string = '/ScrewCompressureAPI/GetPrediction'
    public ScrewPredictionPreviousMonthList : string = '/ScrewCompressorPredictionChartAPI/ScrewPredictionPreviousMonth'
    public ScrewPredictionLastUploadList : string = '/ScrewCompressorPredictionChartAPI/ScrewPredictionLastUpload'
    public ScrewPredictionPreviousWeek : string = '/ScrewCompressorPredictionChartAPI/GetPredictionPreviousWeek'

 //#endregion


}