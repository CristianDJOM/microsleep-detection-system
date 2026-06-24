import multiprocessing
import cv2
import mediapipe as mp
import pygame
import RPi.GPIO as GPIO
import requests
import math
import datetime
import time


def set_zoom(frame, zoom_factor):
    # Calcula las dimensiones del área de interés (ROI)
    height, width, _ = frame.shape
    new_height = int(height / zoom_factor)
    new_width = int(width / zoom_factor)
    
    # Calcular la posición de la ROI centrada
    start_x = (width - new_width) // 2
    start_y = (height - new_height) // 2
    end_x = start_x + new_width
    end_y = start_y + new_height
    
    # Recortar la ROI del frame
    roi = frame[start_y:end_y, start_x:end_x]
    
    # Escalar el ROI para mostrarlo
    zoomed_frame = cv2.resize(roi, (width, height))
    
    return zoomed_frame

def detectar_microsuenos(cola_microsueno):
    # Función de dibujo
    mpDibujo = mp.solutions.drawing_utils
    ConfDibu = mpDibujo.DrawingSpec(thickness=1, circle_radius=1)

    # Creamos un objeto donde almacenaremos la malla facial
    mpMallaFacial = mp.solutions.face_mesh
    MallaFacial = mpMallaFacial.FaceMesh(max_num_faces=1)

    # Iniciar la captura de video desde la camara
    cap = cv2.VideoCapture(0)
    
    # Inicializar variables para el control de zoom
    zoom_factor = 2.0
    zoom_step = 0.2
    original_frame = None

    # Variables para el conteo de parpadeos y microsuenos
    parpadeo = False
    tiempo_inicio_parpedeo = 0
    microsueno_completado = False
    #iniciamos el bucle
    while True:
        ret, frame = cap.read()#variable para mostrar la captura de video
        #variables para los puntos de la malla facial
        px = []
        py = []
        lista = []
        # si hubo error en mostrar la captura de video terminar el bucle
        if not ret:
            break
        
        # Aplicar zoom al frame
        zoomed_frame = set_zoom(frame, zoom_factor)
        #correcion de colores
        frameRGB = cv2.cvtColor(zoomed_frame, cv2.COLOR_BGR2RGB)
        #colocando la malla facial
        resultados = MallaFacial.process(frameRGB)
        #si se detecto un rostro
        if resultados.multi_face_landmarks:
            for rostros in resultados.multi_face_landmarks:
                #Dibujar la malla facial
                mpDibujo.draw_landmarks(zoomed_frame, rostros, mpMallaFacial.FACEMESH_TESSELATION, ConfDibu, ConfDibu)
                #enumerando los puntos dibujados en el rostro
                for id, puntos in enumerate(rostros.landmark):
                    al, an, c = frame.shape
                    x, y = int(puntos.x * an), int(puntos.y * al)
                    px.append(x)
                    py.append(y)

                    lista.append([id, x, y])
                    #si los puntos colocados son igual a 468 rostro completo
                    if len(lista) == 468:
                        x1, y1 = lista[145][1:]#Parpado derecho superior
                        x2, y2 = lista[159][1:]#Parpada derecho inferior
                        longitud1 = math.hypot(x2 - x1, y2 - y1)#calcular la distancia entre los parpados

                        x3, y3 = lista[374][1:]#Parpado izquierdo superior
                        x4, y4 = lista[386][1:]#Parpada izquierdo inferior
                        longitud2 = math.hypot(x4 - x3, y4 - y3)
                        
                        #zoom para mantener el rosro a una distancia
                        x5, y5 = lista[193][1:]
                        x6, y6 = lista[417][1:]
                        longitud3 = math.hypot(x6 - x5, y6 - y5)
                        
                        if longitud3 < 35:
                            zoom_factor += zoom_step
                        elif longitud3 > 40:
                            zoom_factor -= zoom_step
                            if zoom_factor < zoom_step:
                                zoom_factor = zoom_step
                                
                        if longitud3 >= 35 and longitud3 <= 40:
                            #si la longitude ambos parpados es menor o igual a 10 se considera que estan cerrados
                            if longitud1 <= 16 and longitud2 <= 16 and not parpadeo:
                                if tiempo_inicio_parpedeo == 0:
                                    tiempo_inicio_parpedeo = time.time()#se comienza a tomar el tiempo
                                    parpadeo = True
                            elif longitud2 > 16 and longitud1 > 16 and parpadeo:#si la longitud es mayor a 10 se considera que estan abiertos
                                parpadeo = False
                                tiempo_inicio_parpedeo = 0
                            #si ya a durado 3 o mas segundos con los ojos cerrados
                            if parpadeo and time.time() - tiempo_inicio_parpedeo >= 3:
                                #se considera que esta teniendo un micro sueño
                                if not microsueno_completado:
                                    cola_microsueno.put(1)  # Indicar que hay microsueno
                                    print("1")
                                    microsueno_completado = True
                            elif not parpadeo and microsueno_completado:#si despues de aber cerrado los ojos y los vuelve abrir
                                cola_microsueno.put(0)  # Indicar que se desperto
                                print("0")
                                microsueno_completado = False
        else:
            zoom_factor = 2.0          
            
        cv2.imshow('Zoomed Frame', zoomed_frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            cola_microsueno.put(-1)
            conteo_microsueno = 0
            GPIO.cleanup()
            break

    cap.release()
    cv2.destroyAllWindows()
    
def acciones(cola_microsueno):
    conteo_microsueno = 0
    
    while True:
        if not cola_microsueno.empty():
            microsueno = cola_microsueno.get()
            if microsueno == -1:
                break
        
            while microsueno == 1:
                GPIO.output(R, GPIO.LOW)
                GPIO.output(G, GPIO.LOW)
                GPIO.output(B, GPIO.LOW)
                GPIO.output(A, GPIO.LOW)
                GPIO.output(G, GPIO.HIGH)
                GPIO.output(A, GPIO.HIGH)
                time.sleep(2)
                GPIO.output(G, GPIO.LOW)
                GPIO.output(A, GPIO.LOW)
                if not cola_microsueno.empty():
                    microsueno = cola_microsueno.get()
                    if microsueno == 0:
                        break
                time.sleep(0.2)
            
            if microsueno == 0:
                fehayhora = datetime.datetime.now()
                data = {
                    'fecha' : 'fechayhora',
                    'Microsueno': '1',
                    'email': 'rubisky@gmail.com'
                }
                conteo_microsueno = conteo_microsueno + 1
                response = requests.post(url, data=data)
                
                if response.status_code == 200:
                    print("Peticion post exitosa")
                    cola_microsueno.put(2)
                else:
                    print("Error en la peticion POST. Codigo de estado:", response.status_code)
                    
        if conteo_microsueno > 0:
            GPIO.output(R, GPIO.LOW)
            GPIO.output(G, GPIO.LOW)
            GPIO.output(B, GPIO.LOW)
            
            GPIO.output(B, GPIO.HIGH)
            time.sleep(0.5)
            GPIO.output(B, GPIO.LOW)
            time.sleep(0.5)
                       
if __name__ == "__main__":
    try:
        R = 23
        B = 24
        G = 25
        A = 4
        
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(R, GPIO.OUT)
        GPIO.setup(G, GPIO.OUT)
        GPIO.setup(B, GPIO.OUT)
        GPIO.setup(A, GPIO.OUT)
        
        
        url = 'https://microsuenos1.onrender.com/Microsueno'
        
        cola_microsueno = multiprocessing.Queue()

        proceso_microsuenos = multiprocessing.Process(target=detectar_microsuenos, args=(cola_microsueno,))
        proceso_acciones = multiprocessing.Process(target=acciones, args=(cola_microsueno,))
        proceso_microsuenos.daemon = True
        proceso_acciones.daemon = True

        proceso_microsuenos.start()
        proceso_acciones.start()

        while True:
            time.sleep(1)
        
    except KeyboardInterrupt:
        GPIO.cleanup()
        cola_microsueno.put(-1)
        print("Proceso interrumpido por el usuario. Saliendo...")