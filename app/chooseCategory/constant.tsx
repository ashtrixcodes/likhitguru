export type ActRegulationQuestion = {
  question: string;
  options: [string, string, string, string];
};

export const actRegulationQuestions: ActRegulationQuestion[] = [
  { question: 'Within how much time does one have to inform once the driving licence is lost?', options: ['(a) Seven days.', '(b) Fifteen days.', '(c) One month.', '(d) Two months.'] },
  { question: 'Upto how much time does one not have to pay the fine to renew the driving license once the validity period is finished?', options: ['(a) One month', '(b) Three months', '(c) Five months', '(d) Seven months'] },
  { question: 'How old should one be to be eligible to get car/jeep driving license?', options: ['(a) Sixteen years.', '(b) Seventeen years.', '(c) Eighteen years.', '(d) Twenty years.'] },
  { question: 'What is the maximum no. of violations of traffic rules beyond which driving license shall be suspended?', options: ['(a) Three times.', '(b) Four times.', '(c) Five times.', '(d) Six times.'] },
  { question: 'After how many years can one obtain the driving license for large vehicle once he/she has obtained the driving license for car/jeep?', options: ['(a) One year.', '(b) Two years.', '(c) Three years.', '(d) Four years.'] },
  { question: 'Which office does the work of changing ownership of vehicle?', options: ['(a) Traffice Police Office.', '(b) District Police Office.', '(c) Transport Management Office.', '(d) None of them.'] },
  { question: 'What is the fee of renewing the driving license of medium vehicle?', options: ['(a) 1500.', '(b) 2000.', '(c) 2500', '(d) 3000'] },
  { question: 'In how many years does one have to renew the driving license?', options: ['(a) 5-5 years.', '(b) 3-3 Years.', '(c) 2-2 Years.', '(d) 7-7 Years.'] },
  { question: 'How much does one have to pay as fee to obtain jeep driving license?', options: ['(a) 1 thousand.', '(b) 7 hundred.', '(c) 2 thousand.', '(d) 15 hundred.'] },
  { question: 'Within how much time does one have to inform the office if the driver changes his/her address?', options: ['(a) 7 days', '(b) 15 days.', '(c) 1 month.', '(d) 45 days.'] },
  { question: 'How many seats are reserved for female in public vehicle?', options: ['(a) Two seats', '(b) Three seats.', '(c) Six seats.', '(d) Five seats.'] },
  { question: 'Within how much time does one not have to pay fine to renew the bluebook once its date is expired?', options: ['(a) 1 month.', '(b) 2 months.', '(c) 3 months.', '(d) 4 months.'] },
  { question: 'After how many hours does the driver of long distance public vehicle have to change his shift?', options: ['(a) 4 hours.', '(b) 6 hours.', '(c) 8 hours.', '(d) As per the needs.'] },
  { question: 'What punishment has been provisioned in law for the driver if he/she drives the vehicle with intention to kill person and the person dies?', options: ['(a) No punishment', '(b) Life imprisonment with forfeiture', '(c) Life imprisement.', '(d) 20 years imprisonment.'] },
  { question: 'After how much time does the bluebook becomes invalid if it isn`t timely renewed?', options: ['(a) 1 year.', '(b) 3 years,', '(c) 5 years.', '(d) 7 years.'] },
  { question: 'How much fee does one have to pay if he/she adds large vehicle in category of his/her driving license?', options: ['(a) 5 hundred.', '(b) 1 thousand.', '(c) 1 thousand 5 hundred.', '(d) 2 Thousand'] },
  { question: 'How much fee does one have to pay to fill up the application for driving license?', options: ['(a) Rs. 100', '(b) Rs. 500', '(C) Rs 300', '(d) Rs. 400'] },
  { question: 'How many years old public vehicles aren`t allowed to be operated?', options: ['(a) 10 Years', '(b) 15 years.', '(c) 20 years.', '(d) 25 years.'] },
  { question: 'How much does one have to pay to renew the license for motorcycle?', options: ['(a)1500.', '(b) 2000.', '(c) 2500', '(d) 3000'] },
  { question: 'What amount has been provisioned for third party insurance?', options: ['(a) 2 Lakh.', '(b) 3 Lakh.', '(c) 4 Lakh.', '(d) 5 Lakh.'] },
  { question: 'After how many hours do the long distance public vehicles have to take break on the road?', options: ['(a) Every three hours.', '(b) Every four hours.', '(c) Every two hours.', '(d) None of them'] },
  { question: 'What is the validity period of driving license?', options: ['(a) One year.', '(b) Three years.', '(c) Five years.', '(d) Ten years.'] },
  { question: 'How many seats are reserved for physically disabled people in large public vehicle that run along local road?', options: ['(a) Two seats.', '(b) Three seats.', '(c) Four seats.', '(d) Five seats.'] },
  { question: 'How long can a driving license be suspended?', options: ['(a) Three months.', '(b) Five months.', '(c) Six months.', '(d) Eight months.'] },
  { question: 'How much does one have to pay to renew the driving license for large vehicles?', options: ['(a) 1500', '(b) 2000.', '(c) 2500.', '(d) Not of them'] },
  { question: 'After how much time from the expiry date does one have to pay fine to renew the driving licence?', options: ['(a) One month.', '(b) Three months.', '(c) Five months.', '(d) Seven months.'] },
  { question: 'How much rupee ticket has to be pasted on the application form for the route permit & change of ownership?', options: ['(a) Five rupees.', '(b) Ten rupees.', '(c) Two rupees.', '(d) One rupee.'] },
  { question: 'Within how much time does one have to submit the application for the copy of driving license if it is lost or spoiled?', options: ['(a) 3 days.', '(b) 7 days.', '(c) 15 days.', '(d) 30 days.'] },
  { question: 'What provision of punishment has been made if the vehicle without pollution pass sticker enters the prohibited area?', options: ['(a) Imprisonment', '(b) Confiscation of vehicle', '(c) Restriction to drive in future.', '(d) Fine for the driver.'] },
  { question: 'How much additional fine does one have to pay for the renewal of driving license after one year of the due renewal date?', options: ['(a) 150 percent.', '(b) 50 percent.', '(c) 30 percent.', '(d) 100 percent.'] },
  { question: 'As per the Vehicle and Transport Management Act, what age one must have reached for obtaining the license for large vehicle?', options: ['(a) 16 years.', '(b) 18 years.', '(c) 21 years.', '(d) 25 years.'] },
  { question: 'How often is the pollutation of private vehicle tested?', options: ['(a) Every 3 months', '(b) Every six months.', '(c) Every 1 year.', '(d) Every 2 years'] },
  { question: 'Within how much time does one have to register his/her vehicle after he/she clarifies the custom dues?', options: ['(a) Ten days.', '(b) Fifteen days.', '(c) Twenty days.', '(d) Twentyfive days'] },
  { question: 'What is the limitation of weight of large vehicle?', options: ['(a) More than 10 ton.', '(b) From 4 ton to 10 ton.', '(c) Less than 4 ton.', '(d) 1 ton.'] },
  { question: 'What is the limitation of weight of medium size vehicle', options: ['(a) 10 ton.', '(b) From 1 ton to 4 ton.', '(c) For 4 ton to 10 ton.', '(d) 1 ton.'] },
  { question: 'What is the limitation of weight of small size vehicle?', options: ['(a) 10 ton', '(b) Less than 4 ton.', '(c) Less than 1 ton.', '(d) 1 ton.'] },
  { question: 'When was Vehicle & Transport Management Act enacted?', options: ['(a) V.S 2048.', '(b) V.S. 2049.', '(c) V.S. 2054.', '(d) V.S. 2050'] },
  { question: 'Which is the vechicular pollution standard prevailing in Nepal?', options: ['(a) Nepal Vehicle Mass Emmision Standard, 2056,', '(b) Nepal Vehicle Mass Emmision Standard, 2060,', '(c) Nepal Vehicle Mass Emmision Standard, 2065,', '(d) Nepal Vehicle Mass Emmision Standard, 2069'] },
  { question: 'How often does one have to renew bluebook?', options: ['(a) Every 6 months.', '(b) Every 1 year.', '(c) Every 2 years.', '(d) Every 4 years.'] },
  { question: 'Upto how many years can one renew his/her driving license by paying fine once it is expired?', options: ['(a) 5 Years', '(b) 3 years.', '(c) 2 years', '(d) 7 years'] },
  { question: 'Within how much time does one have to pay license fee after he/she has passed the trial for driving license?', options: ['(a) 18 months', '(b) 5 years', '(c) 15 days', '(d) 90 days'] },
  { question: 'How much fee does one have to pay for the duplicate copy of driving license?', options: ['(a) Two hundred', '(b) Five hundred', '(c) One thousand', '(d) One thousand five hundred'] },
  { question: 'What is/are the condition(s) in which driving license can be invalid?', options: ['(A) If proved disqualified as per the act.', '(b) If the driver dies.', '(C) If the person wants to cancel it voluntariliy', '(d) All of the above'] },
  { question: 'Upto how much time is one who has misconducted in the written exam of driving license not allowed to enroll in such exam?', options: ['(a) 1 year.', '(b) 2 months.', '(c) 3 months.', '(d) None of them'] },
  { question: 'What is the maximum time upto which a temporary vehicle registration certificate remain valid?', options: ['(a) 1 month.', '(b) 3 months.', '(c) 6 months', '(d) 1 year'] },
  { question: 'What is the road covers more than 250 kilometer distance called?', options: ['(a) Long road.', '(b) Local road.', '(c) Short road.', '(d) None of them.'] },
  { question: 'For driving which vehicle is 21 years (or more) old person eligible?', options: ['(a) Small.', '(b) Medium.', '(c) Large.', '(d) All of the above'] },
  { question: 'How much fine has been provisioned if one drives without getting driving license?', options: ['(a) Rs. 200 to 500.', '(b) Only rs. 400', '(c) Rs. 500 to 2000.', '(d) Upto rs.100.'] },
  { question: 'How long does the probation period of driving license?', options: ['(a) 6 months.', '(b) 1 year.', '(c) 3 months.', '(d) 18 months.'] },
  { question: 'How much time is added to validity period in driving license if a category is added.', options: ['(a) 5 years.', '(b) 3 months', '(c) not increase', '(d) 18 months.'] },
  { question: 'Upto how long time in maximum has the temporary route permit been provisioned?', options: ['(a) 14 days.', '(b) 7 days.', '(c) 5 days.', '(d) One month.'] },
  { question: 'How long does route permit remain valid once it is taken?', options: ['(a) 4 months.', '(b) 6 months.', '(c) 3 months.', '(d) 1 year.'] },
  { question: 'Within how many days does one have to renew route permit once it is expired?', options: ['(a) 4 days.', '(b) 6 days.', '(c) 15 days.', '(d) 1 year.'] },
  { question: 'What percent extra fee does one have to pay to renew route permit for one month after it is expired?', options: ['(a) 50 percent.', '(b) 25 percent.', '(c) 100 percent.', '(d) No additional charge'] },
  { question: 'Within how many days does one have to take route permit after its fitness test?', options: ['(a) 45 days.', '(b) 60 days.', '(c) 90 days.', '(d) None of them'] },
  { question: 'As per new procedure, what minimum percent marks does one have to obtain to pass the written exam for driving license?', options: ['(a) 50 percent.', '(b) 60 percent.', '(c) 80 percent.', '(d) 70 percent.'] },
  { question: 'What punishment is provisioned to those who hijack a moving vehicle and changes its course?', options: ['(a) Imprisonment or fine .', '(b) Confiscation of vehicle.', '(c) bamishing from nation', '(d) All of them.'] },
  { question: 'Within how many days does one have to return his/her cancelled driving license to the competent authority?', options: ['(a) 7 days.', '(b) 14 days.', '(c) 35 days.', '(d) 15 days'] },
  { question: 'What punishment is provisioned if one drives vehicle changing number plate?', options: ['(A) 6 months imprisonment.', '(b) 5 to 15 thousand fine.', '(c) Confiscation of vehicle.', '(d) All of the above'] },
  { question: 'How much insurance amount has been provisioned for public vehicle driver and other employees?', options: ['(a) Rs. 500,000.', '(b) Rs. 200,000.', '(c) Rs. 3,00,000.', '(d) Rs. 600,000'] },
  { question: 'What is the maximum length of local road?', options: ['(a) Upto 150 kilometers.', '(b) Up to 50 kilometers', '(c) Upto 25 kilometers', '(d) Longer than 250 kilometers'] },
  { question: 'What is the percentage concession of fare provisioned for senior citizens in public vehicle?', options: ['(a) 5 percent.', '(b) 50 percent.', '(c) 15 percent.', '(d) 20 percent.'] },
  { question: 'After how many years of production, shall a vehicle be not registered as public or other types of vehicle?', options: ['(a) 20 years.', '(b) 15 years.', '(c) 5 years.', '(d) 25 years.'] },
  { question: 'After how many years of expiry of registration can a vehicle be re-registered?', options: ['(a) 3 years.', '(b) 15 years.', '(c) 7 years.', '(d) 5 years.'] },
  { question: 'Which of the following is considered as long distance road?', options: ['(a) Less than 100 KM road.', '(b) Longer than 250 KM road', '(c) Less than 25 KM road.', '(d) None of them.'] },
  { question: 'Which of the following is considered as medium distance road?', options: ['(a) Longer than 250 KM road', '(b) Road between 100 to 250 KM.', '(c) Less than 25 KM road.', '(d) Road between 25 to 100 KM.'] },
  { question: 'Which of the following is considered as short distance road?', options: ['(a) Longer than 250 KM road', '(b) Road between 100 to 250 KM.', '(c) Less than 25 KM road.', '(d) Road between 25 to 100 KM.'] },
  { question: 'What is the maximum period for which foeign one time or cumulative validity period of temporary registration certificate?', options: ['(a) 4 months.', '(b) 6 months.', '(c) 14 months.', '(d) 5 years.'] },
  { question: 'What is the maximum period for foreign registered vehicle which can be permitted to operate in Nepal?', options: ['(a) 1 month.', '(b) 1 year', '(c) 5 years', '(d) Not allowed'] },
  { question: 'How much does one have to pay to change the ownership changing of a vehicle?', options: ['(A) 50% amount of vehicle registration charge.', '(b) Rs. 5000.', '(c) whatever is needed for registration charge', '(d) Rs. 1500.'] },
  { question: 'If registration certificate is suspended, within how many days does one have to submit Vehicle Registration Certificate with the written order of authorized officer?', options: ['(a) 7 days.', '(b) 15 days.', '(c) 35 days.', '(d) 21 days'] },
  { question: 'Which of the following exams is not required for an applicant to add categtory in the driving license?', options: ['(a) Written.', '(b) Practical.', '(c) Both of them', '(d) None of them'] },
  { question: 'What is the minimum marks required to pass the practical exams of driving license of Category B?', options: ['(a) 50 percent.', '(b) 60 percent.', '(c) 70 percent.', '(d) 80 percent.'] },
  { question: 'What will happen if an examinee touches the boundary line making U-turn in the practical exam for driving license of Category B (car / jeep / delivery van)?', options: ['(a) 10 marks decreases.', '(b) 15 marks decreases', '(c) Declares failure', '(d) Nothing happens.'] },
  { question: 'What is the marks that one can secure upon successful completion of 8 (eight) formation for driving license of Category B?', options: ['(a) 10 marks', '(b) 20 marks', '(c) 15 marks', '(d) 25 marks'] },
  { question: 'What is the permissible number of engine stoppage in trial exam of catgegory B?', options: ['(a) 1 time.', '(b) 2 times.', '(c) 3 times.', '(d) 4 times'] },
  { question: 'How much marks is deducted if the examinee starts driving without using seatbelt in the trial exam for the driving license of Catagory B (car / jeep / delivery van)?', options: ['(a) 2 marks.', '(b) 4 marks.', '(c) No mark decreases', '(d) Declared unqualified'] },
  { question: 'What is the width of garage track in the garage parking section exam of trial exam of driving license of Catagory B (Car / Jeep / Delivery Van)?', options: ['(a) 2 meter', '(b) 3 meter', '(c) 4 meter', '(d) 5 meter'] },
  { question: 'How much marks is deducted if the examinee doesn`t follow traffic signal in the trial exam for driving license of Catagory B (car / jeep / delivery van) driver\'s license?', options: ['(a) 10 marks.', '(b) 15 marks.', '(c) 20 marks.', '(d) No mark decreases'] },
  { question: 'What is the length of test track used for speed breaker (ramp test) in the practical exam for driving license of B Catagory (car / jeep / delivery van)?', options: ['(A) 12 meter.', '(b) 14 meter.', '(c) 16 meter.', '(d) 20 meter.'] },
  { question: 'Within what duration of passing the written exam, can one appear in trial exam?', options: ['(a) Upto 6 months.', '(b) Upto 9 months.', '(c) Upto 12 months.', '(d) Upto 18 months'] },
  { question: 'For how many times can one appear in trial exam once he/she the passes the written exam?', options: ['(a) 1 time.', '(b) 2 times.', '(c) 3 times.', '(d) 4 times.'] },
  { question: 'What is understood by public place, as per Vehicle and Transport Management Act?', options: ['(a) Bridge.', '(b) Road.', '(c) Footpath', '(d) All of the above'] },
  { question: 'What is the time duration by which a private vehicle owner has to pay vehicular tax?', options: ['(a) End of Ashar', '(b) End of Chitra', '(c) Endo of Ashwin', '(d) Within 3 months after the date ends'] },
  { question: 'Within how many days does one have to return the cancelled driving license?', options: ['(a) Within ten days.', '(b) Within fifteen days.', '(c) Within thirty days.', '(d) None of them'] },
  { question: 'Which of the following categories is the tourist vehicle equivalent to?', options: ['(a) Public vehicle', '(b) Private vehicle', '(c) Government vehicle.', '(d) Diplomatic vehicles.'] },
  { question: 'What is the specified seating capacity of a mini bus?', options: ['(a) 15 to 25 including driver.', '(b) 12 to 20 including driver.', '(c) 10 to 22 including driver.', '(d) 24 including driver.'] },
  { question: 'What is the age limit after which one cannot acquire driving license for large and medium size public vehicle?', options: ['(a) 55 years.', '(b) 50 years.', '(c) 60 years.', '(d) 45 years.'] },
  { question: 'What is the fee applicable for fitness test certificate of medium and small vehicle at VFTC (Vehicle Fitness Test Center)?', options: ['(a) Rs. 200', '(b) Rs. 400', '(c) Rs. 450', '(d) Rs. 300'] },
  { question: 'According to the Vehicle Act, what do you mean by driver?', options: ['(A) One who drives vehicle', '(b) One who has got the driving license', '(c) One who works at transportation professsional company.', '(d) One who works at organatzation and institutions.'] }
];

// Correct answer key based on the provided answers (converted to array indices 0-3)
export const actRegulationAnswerKeyIndices: number[] = [
  0, // Q131: (a) Seven days.
  1, // Q132: (b) Three months
  2, // Q133: (c) Eighteen years.
  2, // Q134: (c) Five times.
  2, // Q135: (c) Three years.
  2, // Q136: (c) Transport Management Office.
  0, // Q137: (a) 1500.
  0, // Q138: (a) 5-5 years.
  3, // Q139: (d) 15 hundred.
  1, // Q140: (b) 15 days.
  2, // Q141: (c) Six seats.
  2, // Q142: (c) 3 months.
  1, // Q143: (b) 6 hours.
  1, // Q144: (b) Life imprisonment with forfeiture
  2, // Q145: (c) 5 years.
  1, // Q146: (b) 1 thousand.
  0, // Q147: (a) Rs. 100
  2, // Q148: (c) 20 years.
  0, // Q149: (a) 1500.
  3, // Q150: (d) 5 Lakh.
  1, // Q151: (b) Every four hours.
  2, // Q152: (c) Five years.
  0, // Q153: (a) Two seats.
  2, // Q154: (c) Six months.
  0, // Q155: (a) 1500
  1, // Q156: (b) Three months.
  1, // Q157: (b) Ten rupees.
  3, // Q158: (d) 30 days.
  3, // Q159: (d) Fine for the driver.
  1, // Q160: (b) 50 percent.
  2, // Q161: (c) 21 years.
  2, // Q162: (c) Every 1 year.
  1, // Q163: (b) Fifteen days.
  0, // Q164: (a) More than 10 ton.
  2, // Q165: (c) For 4 ton to 10 ton.
  1, // Q166: (b) Less than 4 ton.
  1, // Q167: (b) V.S. 2049.
  3, // Q168: (d) Nepal Vehicle Mass Emmision Standard, 2069
  1, // Q169: (b) Every 1 year.
  0, // Q170: (a) 5 Years
  3, // Q171: (d) 90 days
  1, // Q172: (b) Five hundred
  3, // Q173: (d) All of the above
  0, // Q174: (a) 1 year.
  2, // Q175: (c) 6 months
  0, // Q176: (a) Long road.
  2, // Q177: (c) Large.
  2, // Q178: (c) Rs. 500 to 2000.
  1, // Q179: (b) 1 year.
  2, // Q180: (c) not increase
  0, // Q181: (a) 14 days.
  3, // Q182: (d) 1 year.
  2, // Q183: (c) 15 days.
  0, // Q184: (a) 50 percent.
  0, // Q185: (a) 45 days.
  1, // Q186: (b) 60 percent.
  0, // Q187: (a) Imprisonment or fine
  0, // Q188: (a) 7 days.
  3, // Q189: (d) All of the above
  3, // Q190: (d) Rs. 600,000
  2, // Q191: (c) Upto 25 kilometers
  1, // Q192: (b) 50 percent.
  0, // Q193: (a) 20 years.
  3, // Q194: (d) 5 years.
  1, // Q195: (b) Longer than 250 KM road
  1, // Q196: (b) Road between 100 to 250 KM.
  3, // Q197: (d) Road between 25 to 100 KM
  2, // Q198: (c) 14 months.
  1, // Q199: (b) 1 year
  0, // Q200: (a) 50% amount of vehicle registration charge.
  1, // Q201: (b) 15 days.
  2, // Q202: (c) Both of them
  2, // Q203: (c) 70 percent.
  2, // Q204: (c) Declares failure
  1, // Q205: (b) 20 marks
  1, // Q206: (b) 2 times.
  3, // Q207: (d) Declared unqualified
  3, // Q208: (d) 5 meter
  1, // Q209: (b) 15 marks.
  2, // Q210: (c) 16 meter.
  2, // Q211: (c) Upto 12 months.
  2, // Q212: (c) 3 times.
  3, // Q213: (d) All of the above
  0, // Q214: (a) End of Ashar
  1, // Q215: (b) Within fifteen days.
  0, // Q216: (a) Public vehicle
  0, // Q217: (a) 15 to 25 including driver.
  2, // Q218: (c) 60 years.
  2, // Q219: (c) Rs. 450
  1  // Q220: (b) One who has got the driving license
];

// Convert answer key indices to letter format for easier reading
export const actRegulationAnswerKeyLetters: ('a' | 'b' | 'c' | 'd')[] = actRegulationAnswerKeyIndices.map(index => {
  const letters: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return letters[index];
});

// Helper function to get the correct answer for a specific question
export function getCorrectAnswer(questionIndex: number): string {
  if (questionIndex < 0 || questionIndex >= actRegulationQuestions.length) {
    throw new Error('Invalid question index');
  }

  const correctIndex = actRegulationAnswerKeyIndices[questionIndex];
  return actRegulationQuestions[questionIndex].options[correctIndex];
}

// Helper function to check if an answer is correct
export function isAnswerCorrect(questionIndex: number, selectedOptionIndex: number): boolean {
  if (questionIndex < 0 || questionIndex >= actRegulationQuestions.length) {
    throw new Error('Invalid question index');
  }

  if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
    throw new Error('Invalid option index');
  }

  return actRegulationAnswerKeyIndices[questionIndex] === selectedOptionIndex;
}

// Helper function to get question statistics
export function getQuestionStats() {
  return {
    totalQuestions: actRegulationQuestions.length,
    answerDistribution: {
      a: actRegulationAnswerKeyLetters.filter(answer => answer === 'a').length,
      b: actRegulationAnswerKeyLetters.filter(answer => answer === 'b').length,
      c: actRegulationAnswerKeyLetters.filter(answer => answer === 'c').length,
      d: actRegulationAnswerKeyLetters.filter(answer => answer === 'd').length
    }
  };
}

export type TechAndMechanicalQuestion = {
  question: string;
  options: [string, string, string, string];
};

export const techAndMechanicalQuestions: TechAndMechanicalQuestion[] = [
  { question: 'Whose duty is it to confirm the condition of vehicle before driving it?', options: ['(a) Traffic Police`s', '(b) Mechanical Engineer`s', '(c) Driver\'s', '(d) Transportation Management Office\'s'] },
  { question: 'What should be done to stop the vehicle immediately?', options: ['(a) Use brakes safely', '(b) Blow horn', '(c) Ask the traffic police', '(d) None of the above'] },
  { question: 'From where can water leak into engine?', options: ['(a) From silencer pipe', '(b) From gauge pipe that checks engine oil', '(c) From air cleaner', '(d) All of the above'] },
  { question: 'What is the function of a speedometer?', options: ['(a) Measure the speed of the vehicle', '(b) Measure the temperature of vehicle.', '(c) Measure the fuel in vehicle', '(d) All of the above.'] },
  { question: 'In what condition does brake light glow?', options: ['(a) While changing gears.', '(b) While pressing accelerator', '(c) While using foot brake.', '(d) While blowing horn.'] },
  { question: 'What is the function of a spark plug?', options: ['(a) To ignite the mixture of air & fuel in engine.', '(b) To provide the quantity of water to engine.', '(c) To provide mobil to engine', '(d) None of the above'] },
  { question: 'What kind of vehicle is understood as \'four wheel drive\' vehicle?', options: ['(a) The vehicle that has brakes on all four wheels', '(b) The vehicle with engine power on all four wheels', '(c) The vehicle used for short distance.', '(d) All of the above'] },
  { question: 'Which of the following source powers the horn?', options: ['(a) Electricity', '(b) Air pressure', '(c) Brake', '(d) Both a and b'] },
  { question: 'What makes the parts of engine oily?', options: ['(a) Distilled water', '(b) Acid', '(c) Mobil', '(d) Mineral water'] },
  { question: 'What is the name of device that adds the quantity of air & fuel in carburetor?', options: ['(a) Spark plug', '(b) Clutch', '(c) Battery', '(d) Throttle'] },
  { question: 'What does a master cylinder do?', options: ['(a) Helps the vehicle run.', '(b) Helps the vehicle go up.', '(c) Helps the vehicle go back', '(d) Helps the vehicle stop.'] },
  { question: 'Which of the following engines has a carburetor?', options: ['(a) Petrol engine.', '(b) Diesel engine', '(c) Electric engine.', '(d) All of the above'] },
  { question: 'What are the two devices that increase the speed of a vehicle?', options: ['(a) Brakes and accelerators.', '(b) Accelerators and steering', '(c) Gear and accelerator.', '(d) Fan belt and accelerator.'] },
  { question: 'What should be done if there is red light in oil pressure meter situated in dashboard?', options: ['(a) One should start engine.', '(b) One should stop engine.', '(c) One should use brake.', '(d) One should blow horn.'] },
  { question: 'What\'s kept in radiator?', options: ['(a) Petrol', '(b) Diesel', '(c) Water', '(d) Acid'] },
  { question: 'In which gear should you start the engine?', options: ['(a) First gear', '(b) Second gear', '(c) Third gear', '(d) Neutral'] },
  { question: 'What should one do when vehicle emits black smoke while starting?', options: ['(a) Close the silencer pipe.', '(b) Remove the silencer pipe', '(c) Take the vehicle to workshop to repair engine', '(d) Ignore it'] },
  { question: 'What is the name of the meter that measures the power of the battery?', options: ['(a) Lactometer', '(b) Speedometer', '(c) Hydrometer', '(d) Ampere meter'] },
  { question: 'What should be done while reversing the vehicle?', options: ['(a) Stop the vehicle.', '(b) Use the reverse gear', '(c) Slowly back the vehicle using looking glass.', '(d) All of the above'] },
  { question: 'What is the function of a clutch?', options: ['(a) Increase speed', '(b) Decrease speed', '(c) Free engine from gear', '(d) Stop the vehicle'] },
  { question: 'What is consumed while using A/C in a vehicle?', options: ['(a) Power', '(b) Fuel', '(c) Both A and B', '(d) None of them'] },
  { question: 'What is the main function of the gear box?', options: ['(a) Only to run the vehicle speedly', '(b) Only to run the vehicle slowly', '(c) To maintain desired speed', '(d) Help the vehicle come across the ditch'] },
  { question: 'What is the function of brakes?', options: ['(a) Stop the vehicle.', '(b) Speed up the vehicle', '(c) To reverse the vehicle', '(d) To turn the vehicle'] },
  { question: 'What does the fuel meter indicate?', options: ['(a) Level of fuel', '(b) Level of water', '(c) Level of mobil', '(d) All of the above'] },
  { question: 'What should be done to save the vehicle\'s tyres?', options: ['(a) Drive at top gear', '(b) To drive using less air', '(c) Maintain the air pressure', '(d) None of the above'] },
  { question: 'What might happen if the vehicle\'s engine heats up too much?', options: ['(a) The engine might wind up (rotate) more', '(b) The engine might get electric shock', '(c) The engine might cease', '(d) Nothing happens'] },
  { question: 'What is the function of carburetor?', options: ['(a) To cool the engine.', '(b) To heat up engine', '(c) To help increase or decrease engine`s speed.', '(d) To mix up air & fuel as needed.'] },
  { question: 'What should driver not check before driving?', options: ['(a) Lights', '(b) Air in Wheels', '(c) Color of vehicle', '(d) Brake'] },
  { question: 'What should be done if gear oil drips countinously from differential?', options: ['(a) To add oil time and drive the vehicle', '(b) To repair it immediately', '(c) To keep on driving until sound comes', '(d) To keep on driving until engine heats up.'] },
  { question: 'What controls the vehicle\'s wheel?', options: ['(a) Engine', '(b) Brakes', '(c) Body', '(d) Battery'] },
  { question: 'When is reverse light turned on?', options: ['(a) While using brakes', '(b) While using hand brakes', '(c) While pressing the accelerator', '(d) While reversing the vehicle.'] },
  { question: 'What is compressed in diesel engine`s cylinder?', options: ['(a) Water', '(b) Fuel', '(c) Air', '(d) All of the above'] },
  { question: 'What should be checked if footbrake stops working properly all of a sudden?', options: ['(a) To check wheel\'s pressure', '(b) To check brake oil level', '(c) To check master cylinder', '(d) All of the above'] },
  { question: 'What should be done if engine doesn\'t start in winter?', options: ['(a) Turn on A/C', '(b) add water in mobil', '(c) Add fuel.', '(d) start after using choke.'] },
  { question: 'How does battery used in vehicle get charged?', options: ['(a) By vehicle mobil', '(b) By vehicle\'s radiator', '(c) By vehicle\'s dynamo', '(d) None of the above'] },
  { question: 'What is the function of dip stick?', options: ['(a) To check the level of mobil', '(b) To check the level of water', '(c) To maintain the level of oil.', '(d) None of the above'] },
  { question: 'What is the function of an accelerator?', options: ['(a) To cool the engine', '(b) To close the oil.', '(c) To help provide oil on the basis of speed', '(d) To measure smoke'] },
  { question: 'What is the function of differential?', options: ['(a) Turn wheels with different speed.', '(b) To pump up air in wheels', '(c) To patch up puncture.', '(d) None of the above'] },
  { question: 'What is the main function of vehicle\'s axle?', options: ['(a) To bear the load of vehicle and help the wheel turn.', '(b) To only bear the load of the vehicle.', '(c) To use Engine', '(d) To use four wheels'] },
  { question: 'What is a wiper?', options: ['(a) Device to increase speed.', '(b) Device to stop vehicle.', '(c) Towel to wipe vehicle.', '(d) Device to clean the glass.'] },
  { question: 'What is the name of machine that generates electricity in running engine?', options: ['(a) Storage Battery', '(b) Charging Dynamo', '(c) Drycell', '(d) Tourch light'] },
  { question: 'What do we call petrol engine in other words?', options: ['(a) Diesel engine', '(b) Hydraulic engine', '(c) Gasoline engine', '(d) All of the above'] },
  { question: 'In what condition using hand brake is considered dangerous?', options: ['(a) While moving upwards', '(b) While moving downwards', '(c) At the time of high speed.', '(d) In turnings'] },
  { question: 'Where does steering work?', options: ['(a) All the front wheels', '(b) At the back wheels', '(c) At gear', '(d) At engine'] },
  { question: 'Where does the brakes work on vehicle?', options: ['(a) At engine', '(b) At steering', '(c) At wheels', '(d) at gear'] },
  { question: 'On which systems are brakes based?', options: ['(a) Mechanical', '(b) Hydraulic system', '(c) Both a & b', '(d) None of them.'] },
  { question: 'What should be added if the level of water decreases in battery?', options: ['(a) Tap`s water', '(b) Distilled water', '(c) Mineral water', '(d) Mustard oil'] },
  { question: 'When should choke lever be closed?', options: ['(a) After the engine stops.', '(b) Any time.', '(c) After the engine starts', '(d) All of the above'] },
  { question: 'What should be done if black smoke comes while driving?', options: ['(a) To add fuel', '(b) To repair engine', '(c) To close silencer pipe.', '(d) All of the above'] },
  { question: 'Among the options, which one is the device that measures the speed of the running vehicle?', options: ['(a) Hydrometer', '(b) Thermal meter', '(c) Hectometer', '(d) Speedometer'] },
  { question: 'What saves the battery from being overcharged?', options: ['(a) Carburetor', '(b) Cut out', '(c) Air cooler', '(d) None of the above'] },
  { question: 'What is ignition switch related to?', options: ['(a) To engine and clutch.', '(b) To engine and gearbox', '(c) To engine and battery.', '(d) All of the above'] },
  { question: 'In which direction does the vehicle move if the front right wheel gets punctured while moving?', options: ['(a) It doesn`t turn', '(b) It turns to right', '(c) It turns to left', '(d) It stops'] },
  { question: 'Which oil is kept in the steering box?', options: ['(a) Brake oil', '(b) Mobil', '(c) Steering oil', '(d) Grease'] },
  { question: 'What is the main source of electricity in the engine?', options: ['(a) Petrol.', '(b) Battery.', '(c) Mobil.', '(d) Diesel'] },
  { question: 'Among the options below which one doesn`t help the engine stop?', options: ['(a) Running at lower speed.', '(b) If engine remains in right condition.', '(c) If fuel is consumed', '(d) None of the above'] },
  { question: 'What is the minimum displacement volume of engine in four wheeler used in driving school?', options: ['(a) 796 c.c.', '(b) 798 c.c.', '(c) 797 c.c.', '(d) 795 c.c.'] },
  { question: 'How much electrical power has been specified for three wheeler electric vehicles for driving school?', options: ['(a) 1000 watts.', '(b) 800 watts.', '(c) 900 watts.', '(d) 700 watts'] },
  { question: 'What makes the wheels of vehicle turn?', options: ['(a) Radiator.', '(b) Gear.', '(c) Differential.', '(d) None of them'] },
  { question: 'Among the options, what isn`t kept in the radiator?', options: ['(a) Petrol.', '(b) Diesel.', '(c) Acid.', '(d) All of the above'] },
  { question: 'What increases/decreases the power of engine?', options: ['(a) Accelerator.', '(b) Brake.', '(c) Steering.', '(d) Clutch.'] },
  { question: 'What provides current to the vehicle\'s engine?', options: ['(a) Accelerator.', '(b) Clutch.', '(c) Steering.', '(d) Spark plug'] },
  { question: 'What is the function of a dynamo?', options: ['(a) To supply current to engine.', '(b) To cool the water of radiator.', '(c) To charge the battery.', '(d) None of the above'] },
  { question: 'Among the options, what makes the vehicular parts oily?', options: ['(a) Grease.', '(b) Mobil', '(c) Steering oil.', '(d) All of the above'] },
  { question: 'Among the options, what is used to measure the fuel?', options: ['(a) Speedometer', '(b) Thermometer', '(c) Telescope', '(d) None of the above'] },
  { question: 'When are brakes not used?', options: ['(a) While increasing the speed.', '(b) While turning the vehicle', '(c) While reserving the vehicle.', '(d) While stoping the vehicle'] },
  { question: 'What should be done before driving?', options: ['(a) To inspect the condition of the vehicle.', '(b) To inform the traffic', '(c) To inform to mechanical engineer.', '(d) All of the above'] },
  { question: 'What drives the fan?', options: ['(a) Accelerator', '(b) Clutch', '(c) Fan belt', '(d) All of the above'] },
  { question: 'Which of the following indicates the level of fuel in vehicle?', options: ['(a) Fuel gauge', '(b) Speedometer', '(c) Thermometer', '(d) All of the above'] },
  { question: 'What is not the main function of the accelerator?', options: ['(a) To heat the engine.', '(b) To close/stop oil.', '(c) To decrease pollution.', '(d) All of the above'] },
  { question: 'Where does the steering not work?', options: ['(a) At gear', '(b) At engine', '(c) At brake', '(d) None of the above'] },
  { question: 'What does the brake not work at?', options: ['(a) At engine', '(b) At gear', '(c) At steering', '(d) All of the above'] },
  { question: 'What is the main source of electricity in vehicles?', options: ['(a) Fuel', '(b) Engine', '(c) Dynamo', '(d) Battery'] },
  { question: 'What supplies mobil to different parts?', options: ['(a) Choke', '(b) Oil pump', '(c) Carburetor', '(d) All of the above'] },
  { question: 'Which oil is used in engine?', options: ['(a) Kerosene', '(b) Brake oil', '(c) Mobil', '(d) Diesel'] },
  { question: 'What is needed to start the diesel engine?', options: ['(a) Diesel and air.', '(b) Spark plug.', '(c) Petrol and air.', '(d) Current'] },
  { question: 'Which part does not work well if the wheels of vehicle are under water?', options: ['(a) Light', '(b) Clutch', '(c) Footbrake', '(d) Handbrake'] },
  { question: 'What does it mean by C.C. in vehicle?', options: ['(a) The volume of engine cylinder.', '(b) Capacity of brake.', '(c) Capacity of gearbox.', '(d) All of the above'] },
  { question: 'Among the options, which one is the function of a workshop?', options: ['(a) To repair broken vehicles.', '(b) To do the finishing of vehicles', '(c) To build the body of vehicle.', '(d) All of the above'] },
  { question: 'Among the options, what is the function of driving school?', options: ['(a) To help fill up license form.', '(b) To help register the license form', '(c) To help in trial examination.', '(d) To instruct how to drive.'] }
];

// Correct answer key based on the provided answers (converted to array indices 0-3)
export const techAndMechanicalAnswerKeyIndices: number[] = [
  2, // Q221: (c) Driver's
  0, // Q222: (a) Use brakes safely
  3, // Q223: (d) All of the above
  0, // Q224: (a) Measure the speed of the vehicle
  2, // Q225: (c) While using foot brake.
  0, // Q226: (a) To ignite the mixture of air & fuel in engine.
  1, // Q227: (b) The vehicle with engine power on all four wheels
  3, // Q228: (d) Both a and b
  2, // Q229: (c) Mobil
  3, // Q230: (d) Throttle
  3, // Q231: (d) Helps the vehicle stop.
  0, // Q232: (a) Petrol engine.
  2, // Q233: (c) Gear and accelerator.
  1, // Q234: (b) One should stop engine.
  2, // Q235: (c) Water
  3, // Q236: (d) Neutral
  2, // Q237: (c) Take the vehicle to workshop to repair engine
  2, // Q238: (c) Hydrometer
  3, // Q239: (d) All of the above
  2, // Q240: (c) Free engine from gear
  2, // Q241: (c) Both A and B
  2, // Q242: (c) To maintain desired speed
  0, // Q243: (a) Stop the vehicle.
  0, // Q244: (a) Level of fuel
  2, // Q245: (c) Maintain the air pressure
  2, // Q246: (c) The engine might cease
  3, // Q247: (d) To mix up air & fuel as needed.
  2, // Q248: (c) Color of vehicle
  1, // Q249: (b) To repair it immediately
  0, // Q250: (a) Engine
  3, // Q251: (d) While reversing the vehicle.
  2, // Q252: (c) Air
  3, // Q253: (d) All of the above
  3, // Q254: (d) start after using choke.
  2, // Q255: (c) By vehicle's dynamo
  0, // Q256: (a) To check the level of mobil
  2, // Q257: (c) To help provide oil on the basis of speed
  0, // Q258: (a) Turn wheels with different speed.
  0, // Q259: (a) To bear the load of vehicle and help the wheel turn.
  3, // Q260: (d) Device to clean the glass.
  1, // Q261: (b) Charging Dynamo
  2, // Q262: (c) Gasoline engine
  2, // Q263: (c) At the time of high speed.
  0, // Q264: (a) All the front wheels
  2, // Q265: (c) At wheels
  2, // Q266: (c) Both a & b
  1, // Q267: (b) Distilled water
  2, // Q268: (c) After the engine starts
  1, // Q269: (b) To repair engine
  3, // Q270: (d) Speedometer
  1, // Q271: (b) Cut out
  2, // Q272: (c) To engine and battery.
  1, // Q273: (b) It turns to right
  2, // Q274: (c) Steering oil
  1, // Q275: (b) Battery.
  1, // Q276: (b) If engine remains in right condition.
  0, // Q277: (a) 796 c.c.
  0, // Q278: (a) 1000 watts.
  2, // Q279: (c) Differential.
  3, // Q280: (d) All of the above
  0, // Q281: (a) Accelerator.
  3, // Q282: (d) Spark plug
  2, // Q283: (c) To charge the battery.
  3, // Q284: (d) All of the above
  3, // Q285: (d) None of the above
  0, // Q286: (a) While increasing the speed.
  0, // Q287: (a) To inspect the condition of the vehicle.
  2, // Q288: (c) Fan belt
  0, // Q289: (a) Fuel gauge
  3, // Q290: (d) All of the above
  3, // Q291: (d) None of the above
  3, // Q292: (d) All of the above
  2, // Q293: (c) Dynamo
  1, // Q294: (b) Oil pump
  2, // Q295: (c) Mobil
  0, // Q296: (a) Diesel and air.
  2, // Q297: (c) Footbrake
  0, // Q298: (a) The volume of engine cylinder.
  0, // Q299: (a) To repair broken vehicles.
  3  // Q300: (d) To instruct how to drive.
];

// Convert answer key indices to letter format for easier reading
export const techAndMechanicalAnswerKeyLetters: ('a' | 'b' | 'c' | 'd')[] = techAndMechanicalAnswerKeyIndices.map(index => {
  const letters: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return letters[index];
});

// Helper function to get the correct answer for a specific question
export function getTechCorrectAnswer(questionIndex: number): string {
  if (questionIndex < 0 || questionIndex >= techAndMechanicalQuestions.length) {
    throw new Error('Invalid question index');
  }

  const correctIndex = techAndMechanicalAnswerKeyIndices[questionIndex];
  return techAndMechanicalQuestions[questionIndex].options[correctIndex];
}

// Helper function to check if an answer is correct
export function isTechAnswerCorrect(questionIndex: number, selectedOptionIndex: number): boolean {
  if (questionIndex < 0 || questionIndex >= techAndMechanicalQuestions.length) {
    throw new Error('Invalid question index');
  }

  if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
    throw new Error('Invalid option index');
  }

  return techAndMechanicalAnswerKeyIndices[questionIndex] === selectedOptionIndex;
}

// Helper function to get question statistics
export function getTechQuestionStats() {
  return {
    totalQuestions: techAndMechanicalQuestions.length,
    answerDistribution: {
      a: techAndMechanicalAnswerKeyLetters.filter(answer => answer === 'a').length,
      b: techAndMechanicalAnswerKeyLetters.filter(answer => answer === 'b').length,
      c: techAndMechanicalAnswerKeyLetters.filter(answer => answer === 'c').length,
      d: techAndMechanicalAnswerKeyLetters.filter(answer => answer === 'd').length
    }
  };
}

// Type definitions
export interface PollutionQuestion {
  question: string;
  options: string[];
}

// Vehicle Pollution Questions (Q301-Q320)
export const vehiclePollutionQuestions: PollutionQuestion[] = [
  { question: 'What is meant by vehicle pollution?', options: ['(a) Mobile used in engine', '(b) Fuel kept in vehicle', '(c) Dirt in the vehicle', '(d) Smoke coming from vehicle'] },
  { question: 'Which part of the vehicle affects the vehicular pollution?', options: ['(a) Brake', '(b) Gearbox', '(c) Fuel', '(d) The condition of engine'] },
  { question: 'Which engine produces least pollution?', options: ['(a) Diesel engine', '(b) Petrol engine', '(c) Electric engine', '(d) Coal engine'] },
  { question: 'What kind of pollution is made by horn?', options: ['(a) Air pollution', '(b) Soil pollution', '(c) Water pollution', '(d) Sound pollution'] },
  { question: 'Which vehicular engine among two-stroke and four-stroke engine makes more pollution?', options: ['(a) Two-stroke', '(b) Four-stroke', '(c) Both of them', '(d) None of the above'] },
  { question: 'What kind of vehicle is more suitable for making a city pollution free?', options: ['(a) Electric', '(b) Diesel', '(c) Petrol', '(d) Gas'] },
  { question: 'Where is the pollution level of EV (Electric Vehicle) checked?', options: ['(a) Department of Transport Management', '(b) Electricity Authority', '(c) Transportation Management Office', '(d) None of them'] },
  { question: 'In which area should horn not be blown?', options: ['(a) Main road', '(b) Area where there is traffic jam', '(c) Area near school and hospital', '(d) Area where there is demonstration'] },
  { question: 'From which part of vehicle does smoke exit?', options: ['(a) Silencer', '(b) Engine', '(c) Gear', '(d) Axle'] },
  { question: 'Which is the prevailing pollution standard in Nepal?', options: ['(a) 2054 B.S.', '(b) 2049 B.S.', '(c) 2069 B.S.', '(d) 2056 B.S.'] },
  { question: 'Why is vehicular pollution test done?', options: ['(a) To know the condition of the vehicle', '(b) To save the vehicle from accident', '(c) Both a and b', '(d) None of them'] },
  { question: 'Which office does the vehicular pollution test?', options: ['(a) Vehicle Fitness Test Center', '(b) Transportation Management Office', '(c) Traffic Police Office', '(d) Both a and b'] },
  { question: 'Among the vehicles mentioned below, to which kind of vehicle is vehicular pollution Standards, 2069 not applicable?', options: ['(a) Private vehicles', '(b) Large buses', '(c) Heavy equipment like dozer loaders etc.', '(d) All of them'] },
  { question: 'What happens if one drives the vehicle with no pollution free sticker in restricted area?', options: ['(a) Fine', '(b) Confiscation of vehicle', '(c) Imprisonment', '(d) Both a and b'] },
  { question: 'What kind of vehicle\'s pollution is not checked?', options: ['(a) Vehicle run by petrol', '(b) Electric vehicle', '(c) Vehicle run by Diesel', '(d) None of the above'] },
  { question: 'Which office doesn\'t do vehicular pollution test?', options: ['(a) Vehicle Fitness Test Center', '(b) Transportation Management Office', '(c) Traffic Police Office', '(d) None of them'] },
  { question: 'What is normally checked in a vehicular pollution test?', options: ['(a) Brake', '(b) Body', '(c) Smoke', '(d) Fuel'] },
  { question: 'Which office does the work of vehicle fitness test?', options: ['(a) Ministry for Physical Infrastructure and Transport', '(b) Department of Transport Management', '(c) Traffic Police Office', '(d) Transport Management Office'] },
  { question: 'What color sticker is attached to safa(clean) tempo?', options: ['(a) Blue', '(b) Red', '(c) Green', '(d) None of them'] },
  { question: 'Which pollution is caused by vehicular smoke?', options: ['(a) Air pollution', '(b) Soil pollution', '(c) Water pollution', '(d) Sound pollution'] }
];

// Correct answer key based on the provided answers (converted to array indices 0-3)
export const vehiclePollutionAnswerKeyIndices: number[] = [
  3, // Q301: (d) Smoke coming from vehicle
  3, // Q302: (d) The condition of engine
  2, // Q303: (c) Electric engine
  3, // Q304: (d) Sound pollution
  0, // Q305: (a) Two-stroke
  0, // Q306: (a) Electric
  3, // Q307: (d) None of them
  2, // Q308: (c) Area near school and hospital
  0, // Q309: (a) Silencer
  2, // Q310: (c) 2069 B.S.
  2, // Q311: (c) Both a and b
  3, // Q312: (d) Both a and b
  3, // Q313: (d) All of them
  3, // Q314: (d) Both a and b
  1, // Q315: (b) Electric vehicle
  3, // Q316: (d) None of them
  2, // Q317: (c) Smoke
  3, // Q318: (d) Transport Management Office
  2, // Q319: (c) Green
  0  // Q320: (a) Air pollution
];

// Convert answer key indices to letter format for easier reading
export const vehiclePollutionAnswerKeyLetters: ('a' | 'b' | 'c' | 'd')[] = vehiclePollutionAnswerKeyIndices.map(index => {
  const letters: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return letters[index];
});

// Helper function to get the correct answer for a specific question
export function getPollutionCorrectAnswer(questionIndex: number): string {
  if (questionIndex < 0 || questionIndex >= vehiclePollutionQuestions.length) {
    throw new Error('Invalid question index');
  }

  const correctIndex = vehiclePollutionAnswerKeyIndices[questionIndex];
  return vehiclePollutionQuestions[questionIndex].options[correctIndex];
}

// Helper function to check if an answer is correct
export function isPollutionAnswerCorrect(questionIndex: number, selectedOptionIndex: number): boolean {
  if (questionIndex < 0 || questionIndex >= vehiclePollutionQuestions.length) {
    throw new Error('Invalid question index');
  }

  if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
    throw new Error('Invalid option index');
  }

  return vehiclePollutionAnswerKeyIndices[questionIndex] === selectedOptionIndex;
}

// Helper function to get question statistics
export function getPollutionQuestionStats() {
  return {
    totalQuestions: vehiclePollutionQuestions.length,
    answerDistribution: {
      a: vehiclePollutionAnswerKeyLetters.filter(answer => answer === 'a').length,
      b: vehiclePollutionAnswerKeyLetters.filter(answer => answer === 'b').length,
      c: vehiclePollutionAnswerKeyLetters.filter(answer => answer === 'c').length,
      d: vehiclePollutionAnswerKeyLetters.filter(answer => answer === 'd').length
    }
  };
}

// (default export consolidated at end of file)

// Type definitions
export interface AccidentalAwarenessQuestion {
  question: string;
  options: string[];
}

// Accidental Awareness Questions (Q331-Q390)
export const accidentalAwarenessQuestions: AccidentalAwarenessQuestion[] = [
  { question: 'What does road safety mean?', options: ['(a) The drivers should be careful.', '(b) Follow the vechicular rules', '(c) To give priority to vehicles running along the road.', '(d) All of the above.'] },
  { question: 'Which light should be turned on while turning the vehicle?', options: ['(a) Fog light.', '(b) Head light.', '(c) Brake light.', '(d) Side light.'] },
  { question: 'What does the red traffic light mean?', options: ['(a) Signal to be alert', '(b) signal to stop the vehicle.', '(c) Signal to be safe', '(d) None of them'] },
  { question: 'When does one have to blow horn?', options: ['(a) At the time of emergency/necessity', '(b) Never to blow the horn', '(c) Blow the horn at crowded places.', '(d) All of the above'] },
  { question: 'In what condition should one stop vehicle?', options: ['(a) If the traffic light signals to stop at crossroad.', '(b) At zebra Crossing where people are crossing the road.', '(c) If traffic police signals to stop.', '(d) All of the above.'] },
  { question: 'In which part of the road is the zebra crossing on?', options: ['(a) Main chowk.', '(b) All chowks.', '(c) Anywhere except chowk.', '(d) All of the above'] },
  { question: 'In what kind of place does the driver have to slow the speed?', options: ['(a) School area', '(b) Densely populated area', '(c) Crossroad', '(d) All of the above'] },
  { question: 'What happens if one drives in high speed ?', options: ['(a) It helps to develop the skills', '(b) One reaches the destination soon.', '(c) It might invite accidents.', '(d) Vehicle becomes old.'] },
  { question: 'What is Zebra Crossing made for?', options: ['(a) To help vehicle cross the road.', '(b) To help animal cross the road.', '(c) To stop the vehicles.', '(d) To help pedestrians cross the road.'] },
  { question: 'What shouldn`t be done while driving in front of school and hospital?', options: ['(a) Blow horn.', '(b) Drive the vehicle high speed.', '(c) To overtake.', '(d) All of the above'] },
  { question: 'What is the speed limit one has to drive in densely populated area?', options: ['(a) Less than 40 KM/Hour.', '(b) More than 40 KM/Hour.', '(c) Less than 35 KM/Hour.', '(d) All of the above.'] },
  { question: 'Whom should the driver inform if accident happens?', options: ['(a) Nearby police', '(b) Nearby resident', '(c) Relatives of those who are injured in accident', '(d) All of the above.'] },
  { question: 'What does a driver have to do when a pedestrian is crossing the road?', options: ['(a) To gesture by hand.', '(b) To increase the speed.', '(c) To return the vehicle', '(d) To decrease the speed & let the pedestrian cross the road'] },
  { question: 'Why does one have to use seat belt while driving?', options: ['(a) To look good.', '(b) To save himself/herself from the punishment of traffic police', '(c) To bear less injuries if accident happens.', '(d) All of the above'] },
  { question: 'What would you do if the tyre gets punctured on the way?', options: ['(a) To keep on driving by ignoring it', '(b) To leave the vehicle at the side and go.', '(c) To use spare tyre and get it repaired.', '(d) None of the above'] },
  { question: 'What should be done while turning the vehicle to left side?', options: ['(a) To jam on brake and stop.', '(b) To turn by turning on right side light.', '(c) To turn by turning the left side light.', '(d) Blow the horn harshly'] },
  { question: 'In the view of safety, what time is considered to be not suitable for driving?', options: ['(a) While it is raining heavily.', '(b) While it is snowing densly.', '(c) All the time of thick fogging.', '(d) All of the above'] },
  { question: 'What is the name of the instrument that police use to find out the speed of the vehicle while driving ?', options: ['(a) Radar gun.', '(b) lidar gun.', '(c) Speed gun.', '(d) All of them'] },
  { question: 'What does red traffic light mean?', options: ['(a) Be alert.', '(b) Stop the vehicle', '(c) Go.', '(d) None of them.'] },
  { question: 'In what way should one overtake another vehicle ?', options: ['(a) Always from the right.', '(b) By blowing the horn.', '(c) If road is straight and safe.', '(d) All of the above'] },
  { question: 'Which vehicle should be given first priority at the round turning ?', options: ['(a) Vehicle coming from the right side.', '(b) Vehicle coming from the left side.', '(c) Vehicle coming from the back side.', '(d) None of the above'] },
  { question: 'Which side should be used while overtaking?', options: ['(a) From left side', '(b) From right side', '(c) From both sides', '(d) From none side'] },
  { question: 'To what kind of injured person from accident should artificial oxygen be given?', options: ['(a) Normal injured.', '(b) Bleeding injured.', '(c) Unconscious injured.', '(d) Conscious injured'] },
  { question: 'Who shouldn`t be informed when accident happens?', options: ['(a) Nearby police.', '(b) Close realatives.', '(c) Relatives of injured.', '(d) Pedestrian'] },
  { question: 'How would one signal the vehicle ahead while overtaking?', options: ['(a) By turning head light', '(b) By blowing horn', '(c) By Turning side light', '(d) All of the above'] },
  { question: 'Why is there more possibility to have accidents at night than day?', options: ['(a) Because of more speed and less visibility.', '(b) Because of more vehicle running', '(c) Because of passengers drunkeness', '(d) None of the above'] },
  { question: 'In what kind of place does one not have to lower the speed?', options: ['(a) Densely populated areas.', '(b) School areas.', '(c) Crossroads.', '(d) Open road.'] },
  { question: 'What shouldn`t be done while driving?', options: ['(a) To talk on mobile.', '(b) To drink alcohol.', '(c) To quarrel/Fight with the passenger.', '(d) All of the above'] },
  { question: 'What lights should be turned on while parking the vehicle at night ?', options: ['(a) Head light.', '(b) Side light.', '(c) Parking light', '(d) None of them.'] },
  { question: 'What should be done if the vehicle from behind tries to overtake ?', options: ['(a) To increase the speed.', '(b) To slow the speed & let it go.', '(c) Blow the horn', '(d) Nothing to be done'] },
  { question: 'Which gear should be used while driving uphill?', options: ['(a) First gear.', '(b) Second gear.', '(c) Third gear.', '(d) Forth gear.'] },
  { question: 'At what time does one have to look at looking glass?', options: ['(a) While overtaking.', '(b) While reversing', '(c) While turning left .', '(d) All of the above.'] },
  { question: 'What should not be done if the vehicle from behind tries to overtake?', options: ['(a) To slow speed & give side', '(b) To increase the speed', '(c) To blow horn', '(d) Both B and C'] },
  { question: 'What condition of the driver is necessaey while driving?', options: ['(a) To put on clean cloth.', '(b) Not have drunk alcohol.', '(c) To put on shoes', '(d) Not to have slept at night.'] },
  { question: 'Whom should the driver inform if mechhnical condition of the vehicle is not good?', options: ['(a) Traffic Police.', '(b) Nearby Police station.', '(c) Vehicle owner or manager.', '(d) District Administration Office.'] },
  { question: 'In what kind of place does one have to stop the vehicle ?', options: ['(a) Bus stop.', '(b) Crowded place.', '(c) Parking spot.', '(d) Middle of the road.'] },
  { question: 'What should a driver do when entering main road from side road?', options: ['(a) To enter at high speed.', '(b) To stop the vehicle in the middle of the main road.', '(c) To enter at safe speed with signal', '(d) To enter without signal.'] },
  { question: 'What should be done while reversing the vehicle?', options: ['(a) To race the engine.', '(b) To look through rear view mirror to see whether there is pedestrian or vehicle', '(c) To look back after stopping and getting down from the vehicle..', '(d) To blow horn'] },
  { question: 'What would you do before you start your vehicle?', options: ['(a) To check oil.', '(b) To check gear.', '(c) To check brake and indicator light.', '(d) All of the above'] },
  { question: 'In what condition is it appropriate to use hand brake?', options: ['(a) While starting vehicle.', '(b) While parking vehicle.', '(c) While stopping vehicle.', '(d) While stopping it immedeatly'] },
  { question: 'What is the cause of vechicular accident?', options: ['(a) Human error.', '(b) Mechanical error.', '(c) Miserable condition of road.', '(d) All of the above'] },
  { question: 'Which vehicle has more possibility to have accident while changing lane immediately at one sided road?', options: ['(a) Vehicle coming from front side.', '(b) Vehicle coming from right side', '(c) Vehicle coming from left side.', '(d) Vehicle coming from back side'] },
  { question: 'What should be done while reversing the vehicle?', options: ['(a) To use back gear.', '(b) To look side mirror.', '(c) To press on accelerator.', '(d) All of the above'] },
  { question: 'What should be condition of the driver?', options: ['(a) To have good eyesight.', '(b) Not tired.', '(c) Not drunk', '(d) All of the above'] },
  { question: 'How should one drive if he/she is in a hurry?', options: ['(a) keep on blowing the horn time & again.', '(b) keep on driving by turning on brake light and moving hands.', '(c) drive at safe speed by turning on emergency lights.', '(d) look for measure to reach as soon as possible.'] },
  { question: 'How would one drive vehicle at turning?', options: ['(a) By driving in low gear', '(b) By lowering speed', '(c) By blowing the horn 2-3 times before turning.', '(d) All of the above.'] },
  { question: 'Who is responsible to effectuate the compensation to victim on vechiular accident?', options: ['(a) Vehicle owner', '(b) Chief District Officer', '(c) Traffic Police', '(d) Traffic Management Office'] },
  { question: 'What happens if one drives vehicle being drunk?', options: ['(a) Accident might happen', '(b) Fines', '(c) Both a and b', '(d) It becomes good/funny'] },
  { question: 'Why should one use seatbelt?', options: ['(a) For rest', '(b) To save oneself from fine', '(c) For safe journey', '(d) None of the above'] },
  { question: 'What should first be done to the injured person in an accident?', options: ['(a) To take him/her to hospital.', '(b) To do primary treatment.', '(c) To remove him/her from crowd.', '(d) Nothing to be done'] },
  { question: 'Does one have to immediately give food to injured person in accident or not?', options: ['(a) Yes', '(b) No', '(c) As per the injured wish', '(d) To give food as per onlooker\'s advice'] },
  { question: 'What might happen while driving during rain?', options: ['(a) Vehicle tyres might get slipped', '(b) Brakes might not work when they are required', '(c) Muddy water might be splashed to pedestrian', '(d) All of the above.'] },
  { question: 'What should not be done at zebra crossing?', options: ['(a) To drive speedily.', '(b) To let the traffic police stand there.', '(c) To stop the vehicle.', '(d) All of the above'] },
  { question: 'What should be done while turning the vehicle to right?', options: ['(a) By turing on left side light.', '(b) By turning on headlight.', '(c) By turning on right side light.', '(d) None of the above'] },
  { question: 'What should be done to stop the vehicle at upward road?', options: ['(a) To use wedge', '(b) To keep the vehicle at first gear.', '(c) To use hand brake.', '(d) All of the above'] },
  { question: 'Which light should be turned on to see vehicle at the time of thick fog or mist?', options: ['(a) Headlights.', '(b) Brake lights.', '(c) Fog lights.', '(d) Side lights'] },
  { question: 'What should be done to your vehicle when you are close to T-Junction', options: ['(a) To let left & right side vehicle pass', '(b) To stop.', '(c) Go ahead only by lowering the speed when the road is safe', '(d) All of the above'] },
  { question: 'Why is mobil used in vehicles?', options: ['(a) To save fuel', '(b) To help engine work well/easy', '(c) To drive vehicle at high speed', '(d) All of the above'] },
  { question: 'What does the black smoke coming from vehicle indicate?', options: ['(a) Silencer pipe is broken.', '(b) silencer pipe missing', '(c) Engine is not in good condition', '(d) No fuel.'] },
  { question: 'In what condition is driving vehicle by pressing the clutch dangerous?', options: ['(a) While driving downward.', '(b) While driving at high speed', '(c) While driving at turning .', '(d) All of the above'] }
];

// Correct answer key based on the provided answers (converted to array indices 0-3)
export const accidentalAwarenessAnswerKeyIndices: number[] = [
  3, // Q331: (d) All of the above
  3, // Q332: (d) Side light
  1, // Q333: (b) signal to stop the vehicle
  0, // Q334: (a) At the time of emergency/necessity
  3, // Q335: (d) All of the above
  0, // Q336: (a) Main chowk
  3, // Q337: (d) All of the above
  2, // Q338: (c) It might invite accidents
  3, // Q339: (d) To help pedestrians cross the road
  3, // Q340: (d) All of the above
  0, // Q341: (a) Less than 40 KM/Hour
  0, // Q342: (a) Nearby police
  3, // Q343: (d) To decrease the speed & let the pedestrian cross the road
  2, // Q344: (c) To bear less injuries if accident happens
  2, // Q345: (c) To use spare tyre and get it repaired
  2, // Q346: (c) To turn by turning the left side light
  3, // Q347: (d) All of the above
  3, // Q348: (d) All of them
  1, // Q349: (b) Stop the vehicle
  3, // Q350: (d) All of the above
  0, // Q351: (a) Vehicle coming from the right side
  1, // Q352: (b) From right side
  2, // Q353: (c) Unconscious injured
  3, // Q354: (d) Pedestrian
  3, // Q355: (d) All of the above
  0, // Q356: (a) Because of more speed and less visibility
  3, // Q357: (d) Open road
  3, // Q358: (d) All of the above
  2, // Q359: (c) Parking light
  1, // Q360: (b) To slow the speed & let it go
  0, // Q361: (a) First gear
  3, // Q362: (d) All of the above
  3, // Q363: (d) Both B and C
  1, // Q364: (b) Not have drunk alcohol
  2, // Q365: (c) Vehicle owner or manager
  2, // Q366: (c) Parking spot
  2, // Q367: (c) To enter at safe speed with signal
  1, // Q368: (b) To look through rear view mirror to see whether there is pedestrian or vehicle
  3, // Q369: (d) All of the above
  1, // Q370: (b) While parking vehicle
  3, // Q371: (d) All of the above
  3, // Q372: (d) Vehicle coming from back side
  0, // Q373: (a) To use back gear
  3, // Q374: (d) All of the above
  2, // Q375: (c) drive at safe speed by turning on emergency lights
  3, // Q376: (d) All of the above
  0, // Q377: (a) Vehicle owner
  2, // Q378: (c) Both a and b
  2, // Q379: (c) For safe journey
  1, // Q380: (b) To do primary treatment
  1, // Q381: (b) No
  3, // Q382: (d) All of the above
  0, // Q383: (a) To drive speedily
  2, // Q384: (c) By turning on right side light
  3, // Q385: (d) All of the above
  2, // Q386: (c) Fog lights
  2, // Q387: (c) Go ahead only by lowering the speed when the road is safe
  1, // Q388: (b) To help engine work well/easy
  2, // Q389: (c) Engine is not in good condition
  3  // Q390: (d) All of the above
];

// Convert answer key indices to letter format for easier reading
export const accidentalAwarenessAnswerKeyLetters: ('a' | 'b' | 'c' | 'd')[] = accidentalAwarenessAnswerKeyIndices.map(index => {
  const letters: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return letters[index];
});

// Helper function to get the correct answer for a specific question
export function getAccidentalAwarenessCorrectAnswer(questionIndex: number): string {
  if (questionIndex < 0 || questionIndex >= accidentalAwarenessQuestions.length) {
    throw new Error('Invalid question index');
  }

  const correctIndex = accidentalAwarenessAnswerKeyIndices[questionIndex];
  return accidentalAwarenessQuestions[questionIndex].options[correctIndex];
}

// Helper function to check if an answer is correct
export function isAccidentalAwarenessAnswerCorrect(questionIndex: number, selectedOptionIndex: number): boolean {
  if (questionIndex < 0 || questionIndex >= accidentalAwarenessQuestions.length) {
    throw new Error('Invalid question index');
  }

  if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
    throw new Error('Invalid option index');
  }

  return accidentalAwarenessAnswerKeyIndices[questionIndex] === selectedOptionIndex;
}

// Helper function to get question statistics
export function getAccidentalAwarenessQuestionStats() {
  return {
    totalQuestions: accidentalAwarenessQuestions.length,
    answerDistribution: {
      a: accidentalAwarenessAnswerKeyLetters.filter(answer => answer === 'a').length,
      b: accidentalAwarenessAnswerKeyLetters.filter(answer => answer === 'b').length,
      c: accidentalAwarenessAnswerKeyLetters.filter(answer => answer === 'c').length,
      d: accidentalAwarenessAnswerKeyLetters.filter(answer => answer === 'd').length
    }
  };
}

export default {
  actRegulationQuestions,
  actRegulationAnswerKeyIndices,
  techAndMechanicalQuestions,
  techAndMechanicalAnswerKeyIndices,
  vehiclePollutionQuestions,
  vehiclePollutionAnswerKeyIndices,
  vehiclePollutionAnswerKeyLetters,
  getPollutionCorrectAnswer,
  isPollutionAnswerCorrect,
  getPollutionQuestionStats,
  accidentalAwarenessQuestions,
  accidentalAwarenessAnswerKeyIndices,
  accidentalAwarenessAnswerKeyLetters,
  getAccidentalAwarenessCorrectAnswer,
  isAccidentalAwarenessAnswerCorrect,
  getAccidentalAwarenessQuestionStats,
};

export interface TrafficSignalKnowledgeQuestion {
  question: string;
  options: string[];
}

export const trafficSignalKnowledgeQuestions: TrafficSignalKnowledgeQuestion[] = [
  { question: 'What should be done when green light glows when you reach zebra crossing?', options: ['(a) To keep on going ahead.', '(b) To stop the vehicle.', '(c) To be prepared to drive the vehicle ahead.', '(d) All of the above.'] },
  { question: 'What should be done when yellow light glows when you reach zebra crossing?', options: ['(a) To keep on going ahead.', '(b) To stop the vehicle.', '(c) To be prepared to drive the vehicle ahead.', '(d) All of the above.'] },
  { question: 'What does zero motion line indicate?', options: ['(a) To stop the vehicle.', '(b) To lower/decrease the speed.', '(c) To turn back the vehicle.', '(d) To drive the vehicle at high speed.'] },
  { question: 'What should be done when red light glows when you reach zebra crossing?', options: ['(a) To keep on going ahead.', '(b) To stop the vehicle.', '(c) To be prepared to drive the vehicle ahead.', '(d) All of the above.'] },
  { question: 'What should be understood when the vehicle\'s rear red light turns on?', options: ['(a) To have changed the gear.', '(b) To have given the side.', '(c) To be using the brakes.', '(d) To be increasing the speed.'] },
  { question: 'What does a triangular shaped traffic light sign indicate?', options: ['(a) Information.', '(b) Awareness.', '(c) Prohibition.', '(d) All of the above.'] },
  { question: 'What does a rectangular/square shaped traffic light sign not indicate?', options: ['(a) Information.', '(b) Awareness.', '(c) Prohibition.', '(d) Both B and C.'] },
  { question: 'What does circular shaped traffic light sign indicate?', options: ['(a) Information.', '(b) Awareness.', '(c) Prohibition.', '(d) All of them.'] },
  { question: 'Why is line drawn on the road?', options: ['(a) To make the movement of vehicle easy.', '(b) To make road good.', '(c) To charge.', '(d) All of the above.'] },
  { question: 'Among the colours below, which one isn\'t used in line drawn on the road?', options: ['(a) White.', '(b) Yellow.', '(c) Red.', '(d) Black.'] },
  { question: 'Which colour isn\'t used in zebra crossing line?', options: ['(a) Yellow.', '(b) Black.', '(c) White.', '(d) None of the above.'] },
  { question: 'What does the continuous white line painted in the middle of the road indicate?', options: ['(a) The line cannot be crossed.', '(b) The line can be crossed.', '(c) Both a & b.', '(d) None of the above.'] },
  { question: 'How many types of colour are there in traffic light?', options: ['(a) 2 types.', '(b) 3 types.', '(c) 4 types.', '(d) 5 types.'] },
  { question: 'To whom is the signal given by the traffic police?', options: ['(a) Vehicle drivers.', '(b) Pedestrians.', '(c) Pedestrians and vehicle drivers.', '(d) None of them.'] },
  { question: 'Among the colours given below, which isn\'t traffic light colour?', options: ['(a) Yellow.', '(b) Red.', '(c) Green.', '(d) Black.'] },
  { question: 'What does automatic traffic signal mean?', options: ['(a) The signal kept at the side of road.', '(b) Electric light kept at the road.', '(c) Signal given by the traffic police.', '(d) None of them.'] },
  { question: 'Whose duty is it to follow the traffic signs?', options: ['(a) Vehicle driver.', '(b) Pedestrian.', '(c) Large vehicle.', '(d) All of the above.'] },
  { question: 'What does traffic signal mean?', options: ['(a) The signal given by vehicle driver.', '(b) The signal given by police.', '(c) The signal to maintain the rules of road.', '(d) All of the above.'] },
  { question: 'How many types of international traffic sign are there?', options: ['(a) Two types.', '(b) Three types.', '(c) Four types.', '(d) No Clarity.'] },
  { question: 'In which part of road is the divider line drawn?', options: ['(a) On right side.', '(b) On left side.', '(c) On the middle of road.', '(d) Wherever it is painted.'] },
  { question: 'What colour board is there on highway to signal direction?', options: ['(a) Green.', '(b) Red.', '(c) Yellow.', '(d) Black.'] },
  { question: 'What is the another name for lane line and zebra crossing?', options: ['(a) Road marking.', '(b) Traffic marking.', '(c) Hotspot.', '(d) All the above.'] },
  { question: 'What is the shape of restrictive/prohibitive traffic sign?', options: ['(a) Circular.', '(b) Triangular.', '(c) Square.', '(d) Rectangular.'] },
  { question: 'Why are traffic lights kept at crossroad?', options: ['(a) So that driver could see it at night.', '(b) To control traffic.', '(c) To turn the vehicle.', '(d) To help vehicle park.'] },
  { question: 'Among the given options, which doesn\'t control traffic on the road?', options: ['(a) Traffic police.', '(b) Department of Transport Management.', '(c) Road line.', '(d) Traffic signal.'] }
];

// Correct answer key based on the provided answers (converted to array indices 0-3)
export const trafficSignalKnowledgeAnswerKeyIndices: number[] = [
  3, // Q391: (d) All of the above
  2, // Q392: (c) To be prepared to drive the vehicle ahead
  0, // Q393: (a) To stop the vehicle
  1, // Q394: (b) To stop the vehicle
  2, // Q395: (c) To be using the brakes
  1, // Q396: (b) Awareness
  3, // Q397: (d) Both B and C
  2, // Q398: (c) Prohibition
  0, // Q399: (a) To make the movement of vehicle easy
  3, // Q400: (d) Black
  0, // Q401: (a) Yellow
  0, // Q402: (a) The line cannot be crossed
  1, // Q403: (b) 3 types
  2, // Q404: (c) Pedestrians and vehicle drivers
  3, // Q405: (d) Black
  1, // Q406: (b) Electric light kept at the road
  3, // Q407: (d) All of the above
  2, // Q408: (c) The signal to maintain the rules of road
  1, // Q409: (b) Three types
  2, // Q410: (c) On the middle of road
  0, // Q411: (a) Green
  0, // Q412: (a) Road marking
  0, // Q413: (a) Circular
  1, // Q414: (b) To control traffic
  1  // Q415: (b) Department of Transport Management
];

// Convert answer key indices to letter format for easier reading
export const trafficSignalKnowledgeAnswerKeyLetters: ('a' | 'b' | 'c' | 'd')[] = trafficSignalKnowledgeAnswerKeyIndices.map(index => {
  const letters: ('a' | 'b' | 'c' | 'd')[] = ['a', 'b', 'c', 'd'];
  return letters[index];
});

// Helper function to get the correct answer for a specific question
export function getTrafficSignalKnowledgeCorrectAnswer(questionIndex: number): string {
  if (questionIndex < 0 || questionIndex >= trafficSignalKnowledgeQuestions.length) {
    throw new Error('Invalid question index');
  }

  const correctIndex = trafficSignalKnowledgeAnswerKeyIndices[questionIndex];
  return trafficSignalKnowledgeQuestions[questionIndex].options[correctIndex];
}

// Helper function to check if an answer is correct
export function isTrafficSignalKnowledgeAnswerCorrect(questionIndex: number, selectedOptionIndex: number): boolean {
  if (questionIndex < 0 || questionIndex >= trafficSignalKnowledgeQuestions.length) {
    throw new Error('Invalid question index');
  }

  if (selectedOptionIndex < 0 || selectedOptionIndex > 3) {
    throw new Error('Invalid option index');
  }

  return trafficSignalKnowledgeAnswerKeyIndices[questionIndex] === selectedOptionIndex;
}

// Helper function to get question statistics
export function getTrafficSignalKnowledgeQuestionStats() {
  return {
    totalQuestions: trafficSignalKnowledgeQuestions.length,
    answerDistribution: {
      a: trafficSignalKnowledgeAnswerKeyLetters.filter(answer => answer === 'a').length,
      b: trafficSignalKnowledgeAnswerKeyLetters.filter(answer => answer === 'b').length,
      c: trafficSignalKnowledgeAnswerKeyLetters.filter(answer => answer === 'c').length,
      d: trafficSignalKnowledgeAnswerKeyLetters.filter(answer => answer === 'd').length
    }
  };
}

// default export provided earlier; do not export again here