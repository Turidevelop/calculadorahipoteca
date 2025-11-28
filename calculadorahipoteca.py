import tkinter as tk
from tkinter import ttk, messagebox
import math
import sys, os

def calcular_cuota():
    try:
        # Obtener valores de los campos
        valor_casa = float(entry_valor.get())
        porcentaje_financiar = float(entry_porcentaje.get())
        interes_anual = float(entry_interes.get())
        años = int(entry_años.get())
        
        # Validaciones básicas
        if valor_casa <= 0:
            messagebox.showerror("Error", "El valor de la casa debe ser mayor a 0")
            return
        if porcentaje_financiar <= 0 or porcentaje_financiar > 100:
            messagebox.showerror("Error", "El porcentaje a financiar debe estar entre 0 y 100")
            return
        if interes_anual < 0:
            messagebox.showerror("Error", "El interés no puede ser negativo")
            return
        if años <= 0:
            messagebox.showerror("Error", "La cantidad de años debe ser mayor a 0")
            return
        
        # Cálculos
        monto_prestamo = valor_casa * (porcentaje_financiar / 100)
        interes_mensual = (interes_anual / 100) / 12
        numero_pagos = años * 12
        
        # Fórmula de la cuota
        if interes_mensual == 0:  # Caso especial: interés 0%
            cuota_mensual = monto_prestamo / numero_pagos
        else:
            factor = (1 + interes_mensual) ** numero_pagos
            cuota_mensual = monto_prestamo * (interes_mensual * factor) / (factor - 1)
        
        # Mostrar resultados
        resultado_texto = f"""
RESULTADOS DEL CÁLCULO HIPOTECARIO:

• Valor de la casa: {valor_casa:,.2f} €
• Porcentaje financiado: {porcentaje_financiar}%
• Monto del préstamo: {monto_prestamo:,.2f} €
• Tipo de interés anual: {interes_anual}%
• Plazo: {años} años ({numero_pagos} meses)

• CUOTA MENSUAL: {cuota_mensual:,.2f} €

• Total a pagar: {cuota_mensual * numero_pagos:,.2f} €
• Total de intereses: {(cuota_mensual * numero_pagos) - monto_prestamo:,.2f} €
"""
        text_resultado.delete(1.0, tk.END)
        text_resultado.insert(tk.END, resultado_texto)
        
    except ValueError:
        messagebox.showerror("Error", "Por favor, introduce valores numéricos válidos en todos los campos")
    except Exception as e:
        messagebox.showerror("Error", f"Ha ocurrido un error: {str(e)}")

def limpiar_campos():
    entry_valor.delete(0, tk.END)
    entry_porcentaje.delete(0, tk.END)
    entry_interes.delete(0, tk.END)
    entry_años.delete(0, tk.END)
    text_resultado.delete(1.0, tk.END)

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Crear ventana principal
root = tk.Tk()
root.title("Calculadora de Hipotecas")
root.iconphoto(True, tk.PhotoImage(file=resource_path("turidevicon.png")))  # Asegúrate de tener un icono.ico en el mismo directorio
root.geometry("600x700")
root.resizable(False, False)

# Título
titulo = tk.Label(root, text="CALCULADORA DE CUOTA HIPOTECARIA", 
                 font=("Arial", 16, "bold"), fg="darkblue")
titulo.pack(pady=10)

# Frame para los campos de entrada
frame_entrada = ttk.Frame(root, padding="10")
frame_entrada.pack(pady=10, fill="x")

# Campo 1: Valor de la casa
label_valor = ttk.Label(frame_entrada, text="Valor de la casa (€):", font=("Arial", 10))
label_valor.grid(row=0, column=0, sticky="w", pady=5)
entry_valor = ttk.Entry(frame_entrada, font=("Arial", 10))
entry_valor.grid(row=0, column=1, sticky="ew", pady=5, padx=5)
entry_valor.insert(0, "215000")

# Campo 2: Porcentaje a financiar
label_porcentaje = ttk.Label(frame_entrada, text="Porcentaje a financiar (%):", font=("Arial", 10))
label_porcentaje.grid(row=1, column=0, sticky="w", pady=5)
entry_porcentaje = ttk.Entry(frame_entrada, font=("Arial", 10))
entry_porcentaje.grid(row=1, column=1, sticky="ew", pady=5, padx=5)
entry_porcentaje.insert(0, "90")

# Campo 3: Interés anual
label_interes = ttk.Label(frame_entrada, text="Interés anual (%):", font=("Arial", 10))
label_interes.grid(row=2, column=0, sticky="w", pady=5)
entry_interes = ttk.Entry(frame_entrada, font=("Arial", 10))
entry_interes.grid(row=2, column=1, sticky="ew", pady=5, padx=5)
entry_interes.insert(0, "2.2")

# Campo 4: Cantidad de años
label_años = ttk.Label(frame_entrada, text="Cantidad de años:", font=("Arial", 10))
label_años.grid(row=3, column=0, sticky="w", pady=5)
entry_años = ttk.Entry(frame_entrada, font=("Arial", 10))
entry_años.grid(row=3, column=1, sticky="ew", pady=5, padx=5)
entry_años.insert(0, "30")

# Configurar el grid para que se expanda
frame_entrada.columnconfigure(1, weight=1)

# Frame para botones
frame_botones = ttk.Frame(root, padding="10")
frame_botones.pack(pady=10)

# Botones
btn_calcular = ttk.Button(frame_botones, text="Calcular Cuota", command=calcular_cuota)
btn_calcular.grid(row=0, column=0, padx=10)

btn_limpiar = ttk.Button(frame_botones, text="Limpiar", command=limpiar_campos)
btn_limpiar.grid(row=0, column=1, padx=10)

btn_salir = ttk.Button(frame_botones, text="Salir", command=root.quit)
btn_salir.grid(row=0, column=2, padx=10)

# Área de resultados
frame_resultado = ttk.LabelFrame(root, text="Resultado del Cálculo", padding="10")
frame_resultado.pack(pady=10, padx=20, fill="both", expand=True)

text_resultado = tk.Text(frame_resultado, height=15, width=70, font=("Courier", 10), wrap=tk.WORD)
scrollbar = ttk.Scrollbar(frame_resultado, orient="vertical", command=text_resultado.yview)
text_resultado.configure(yscrollcommand=scrollbar.set)

text_resultado.pack(side="left", fill="both", expand=True)
scrollbar.pack(side="right", fill="y")

# Información adicional
info_label = tk.Label(root, text="Nota: Este cálculo no incluye seguros, impuestos u otros gastos adicionales", 
                     font=("Arial", 9), fg="gray")
info_label.pack(pady=5)

# Ejecutar la aplicación
root.mainloop()