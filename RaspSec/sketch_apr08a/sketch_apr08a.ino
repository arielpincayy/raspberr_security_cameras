const int pirPin = 2; // Pin de entrada del PIR
int val = 0;

void setup() {
  pinMode(pirPin, INPUT);
  Serial.begin(9600); // Comunicación con Raspberry Pi
}

void loop() {
  int estadoPIR = digitalRead(pirPin);

  if(val == HIGH){
    if(estadoPIR == LOW){
      Serial.println("Movement has sttoped");
    }
  }else{
    if(estadoPIR == HIGH){
      Serial.println("Movement detected");
    }
  }
  val = estadoPIR;
}
