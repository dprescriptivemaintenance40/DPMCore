﻿using DPM.Models.PumpModel;
using DPM_ServerSide.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DPM.Controllers.Pumps.CentrifugalPump
{
    [Route("api/[controller]")]
    [ApiController]

    public class CentrifugalPumpTrainAPIController : ControllerBase
    {
        private readonly DPMDal _context;

        public CentrifugalPumpTrainAPIController(DPMDal context)
        {
            _context = context;
        }
        [HttpGet]
        [Route("getConfiguration")]
        public async Task<IActionResult>  GetClassification()
        {
            string userId = User.Claims.First(c => c.Type == "UserID").Value;
            try
            {
                List<CentrifugalPumpTrainModel> centrifugalPumpClassification = await _context.CentrifugalPumpTrainData.Where(a => a.UserId == userId).OrderBy(a => a.CentrifugalTrainID).ToListAsync();
                var PumpClassificationData = centrifugalPumpClassification.ToList();
                return Ok(PumpClassificationData);
            }
            catch (Exception exe)
            {
                return BadRequest(exe.Message);
            }

        }

        [HttpPost]
        [Route("PumpConfiguration")]
        public async Task<IActionResult> PostConfiguration([FromBody] List<CentrifugalPumpTrainModel> pumpdetails)
        {
            string userId = User.Claims.First(c => c.Type == "UserID").Value;

            try
            {
                var ScrewCompressorConfigurationModel = await _context.AddRuleModels.Where(a => a.MachineType == "Pump" && a.EquipmentType == "Centrifugal Pump").OrderBy(a => a.AddRuleId).ToListAsync();

                double Dcustomer = Convert.ToDouble(ScrewCompressorConfigurationModel[0].Alarm);
                double HAlaram = Convert.ToDouble(ScrewCompressorConfigurationModel[1].Alarm);
                double HTrigger = Convert.ToDouble(ScrewCompressorConfigurationModel[1].Trigger);
                var Formula = ScrewCompressorConfigurationModel[2].Columns;
               // double GConstant = Convert.ToDouble(ScrewCompressorConfigurationModel[3].Alarm);

                List<CentrifugalPumpHQLibraryModel> centrifugalPumpHQLibraryModel = await _context.CentrifugalPumpHQLibraryModels.OrderBy(a => a.CentrifugalPumpHQLibraryID).ToListAsync();
                var HQLibraryList = centrifugalPumpHQLibraryModel.ToList();
                List<double> QLlist = new List<double>();
                string result = "";
                foreach (var i in HQLibraryList)
                {
                    QLlist.Add(Convert.ToDouble(i.Q));
                }
                foreach (var item in pumpdetails)
                {
                    DateTime datetime = item.InsertedDate;
                    if (datetime == DateTime.MinValue)
                    {
                        item.InsertedDate = DateTime.Now;
                    }
                    DateTime dt = item.InsertedDate;
                    DateTime dateOnly = dt.Date;
                    item.InsertedDate = dateOnly;
                    item.UserId = userId;

                    double P1 = Convert.ToDouble(item.P1);
                    double P2 = Convert.ToDouble(item.P2);
                   // double KW = Convert.ToDouble(item.KW);

                    double HCustomernumber = 10 * (P2 - P1) / Dcustomer;
                    //string p1 = string.Format("{0:G}", P1);
                    //string p2 = string.Format("{0:G}", P2);
                    //string d = string.Format("{0:G}", Dcustomer);
                    
                    //var f1 =  Formula.Replace("P1", p1);
                    //var f2 = f1.Replace("P2", p2);
                    //var f3 =  f2.Replace("D", d);
                    //DataTable dtw = new DataTable();
                    //var v = dtw.Compute(f3, "");
                    double Qnumber = Convert.ToSingle(item.Q);
                    double Firstclosest = QLlist.Aggregate((x, y) => Math.Abs(x - Qnumber) < Math.Abs(y - Qnumber) ? x : y);
                    int Firstclosestindex = QLlist.IndexOf(Firstclosest);

                    if (Firstclosestindex != -1)
                    {
                        double difference;
                        if (Qnumber < Firstclosest)
                        {
                            Firstclosestindex = Firstclosestindex - 1;
                            difference = Firstclosest - Qnumber;
                        }
                        else
                        {
                            difference = Qnumber - Firstclosest;
                        }
                        var FirstClosestValue = HQLibraryList[Firstclosestindex];
                        double FirstHClose = Convert.ToDouble(FirstClosestValue.H);
                        double FirstQClose = Convert.ToDouble(FirstClosestValue.Q);
                       // double FirstKWClose = Convert.ToDouble(FirstClosestValue.KW);
                        var SecondClosestValue = HQLibraryList[Firstclosestindex + 1];
                        double SecondHClose = Convert.ToDouble(SecondClosestValue.H);
                        double SecondQClose = Convert.ToDouble(SecondClosestValue.Q);
                       // double SecondKWClose = Convert.ToDouble(SecondClosestValue.KW);
                        double ValueQDifference = SecondQClose - FirstQClose;
                        double DeviationH = (FirstHClose - SecondHClose) / ValueQDifference;
                        double HValueLibrary = FirstHClose - (DeviationH * difference);
                        double Trigger = (HValueLibrary * HTrigger); // Trigger
                        double Alarm = ((HValueLibrary * HAlaram)); // Alarm
                        //double ValueKWDifference = SecondKWClose - FirstKWClose;
                        //double DeviationKW = (SecondKWClose - FirstKWClose) / ValueKWDifference;
                        //double KWValueLibrary = FirstKWClose - (DeviationKW * difference);
                        //double EfficienyFromLib = (Qnumber * Dcustomer * GConstant * HValueLibrary) / KWValueLibrary;
                        //double CustomerEfficiency = (Qnumber * Dcustomer * GConstant * HCustomernumber) / KW;

                        //double LibraryEffSinglePercentage = EfficienyFromLib / 100;
                        //double CustEffLessLibraryEffPercentage = (100 - (CustomerEfficiency / LibraryEffSinglePercentage));

                        if (Trigger >= HCustomernumber)
                        {
                            result = "Degrade";
                        }
                        else if (Alarm >= HCustomernumber)
                        {
                            result = "Incipient";
                        }
                        else
                        {
                            result = "Normal";
                        }

                    }
                    item.Classification = result;
                    _context.CentrifugalPumpTrainData.Add(item);
                    await _context.SaveChangesAsync();

                }
                return Ok(pumpdetails);
            }
            catch (Exception exe)
            {
                return BadRequest(exe.Message);
            }

        }
    }
}
