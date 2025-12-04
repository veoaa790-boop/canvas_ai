import { useEffect, useState } from 'react';
import { fabric } from 'fabric';

interface UseVoiceCommandsProps {
  canvas: fabric.Canvas | null;
  addText: (text: string) => void;
  addShape: (type: string) => void;
  deleteActive: () => void;
  changeColor: (color: string) => void;
}

export const useVoiceCommands = ({ canvas, addText, addShape, deleteActive, changeColor }: UseVoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSupported(true);
    }
  }, []);

  const startListening = () => {
    if (!supported) return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.lang = 'ar-SA'; // Set to Arabic
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setTranscript(command);
      processCommand(command);
    };

    recognition.start();
  };

  const processCommand = (command: string) => {
    console.log('Voice Command (Arabic):', command);

    // Check for Arabic commands (and keep English fallbacks just in case)
    if (command.includes('add text') || command.includes('أضف نص') || command.includes('اضف نص')) {
      addText('نص جديد'); // "New Text" in Arabic
    } 
    else if (command.includes('add circle') || command.includes('أضف دائرة') || command.includes('اضف دائرة')) {
      addShape('circle');
    } 
    else if (command.includes('add rectangle') || command.includes('add box') || command.includes('أضف مستطيل') || command.includes('اضف مستطيل')) {
      addShape('rect');
    } 
    else if (command.includes('add triangle') || command.includes('أضف مثلث') || command.includes('اضف مثلث')) {
      addShape('triangle');
    } 
    else if (command.includes('delete') || command.includes('remove') || command.includes('حذف') || command.includes('مسح')) {
      deleteActive();
    } 
    else if (command.includes('color') || command.includes('لون')) {
      // Arabic Color Mapping
      if (command.includes('red') || command.includes('أحمر') || command.includes('احمر')) changeColor('red');
      else if (command.includes('blue') || command.includes('أزرق') || command.includes('ازرق')) changeColor('blue');
      else if (command.includes('green') || command.includes('أخضر') || command.includes('اخضر')) changeColor('green');
      else if (command.includes('yellow') || command.includes('أصفر') || command.includes('اصفر')) changeColor('yellow');
      else if (command.includes('black') || command.includes('أسود') || command.includes('اسود')) changeColor('black');
      else if (command.includes('white') || command.includes('أبيض') || command.includes('ابيض')) changeColor('white');
      else if (command.includes('purple') || command.includes('بنفسجي')) changeColor('purple');
      else if (command.includes('orange') || command.includes('برتقالي')) changeColor('orange');
    } 
    else if (command.includes('center') || command.includes('توسط') || command.includes('مركز')) {
      const active = canvas?.getActiveObject();
      if (active) {
        canvas?.centerObject(active);
        canvas?.renderAll();
      }
    }
  };

  return { isListening, transcript, startListening, supported };
};
