export const translations = {
  en: {
    workspace: {
      welcome: "Hi {name}, Welcome to {organisation}",
      cards: {
        patientIntake: {
          title: "Inbound Calls",
          description: "Manage what to answer when patients call your centre",
          action: "Go to Patient Intake →"
        },
        remoteMonitoring: {
          title: "Call Patients",
          description: "Reminders, notifications, medical follow-ups",
          action: "Go to Patient Remote Monitoring →"
        },
        scribe: {
          title: "Medical Scribe",
          description: "Transcribe your consultations in real-time",
          action: "Go to Medical Scribe →"
        },
        organisation: {
          title: "Organisation Dashboard",
          description: "Manage credits, patient lists and others",
          action: "Go to Organisation Dashboard →"
        }
      },
      layout: {
        selectOrg: "Select Organization",
        createNewOrg: "Create new organization",
        home: "Home",
        signOut: "Sign out",
        menu: {
          overview: "Overview",
          patientIntake: "Patient Intake",
          remoteMonitoring: "Remote Monitoring",
          organisationDashboard: "Organisation Dashboard"
        }
      },
      intake: {
        title: "Patient Intake",
        liveDashboard: {
          title: "Call Backlog",
          noNumbers: "No registered numbers found for this organisation.",
          loading: "Loading...",
          dateFilter: {
            from: "From",
            to: "To"
          }
        },
        cards: {
          liveDashboard: {
            title: "Live Dashboard",
            description: "View real-time intake data"
          }
        },
        phoneNumberRequired: "Phone number required",
        purchaseNumber: "Purchase Number",
        noPhoneNumberMessage: "You need to purchase a phone number to start using the patient intake system.",
        cards: {
          liveDashboard: {
            title: "Live Dashboard",
            description: "Monitor incoming patient requests in real-time"
          }
        }
      },
      triageDashboard: {
        table: {
          patientName: "Name",
          dateOfBirth: "Date of Birth",
          phoneNumber: "Phone",
          summary: "Summary",
          callTimestamp: "Call Time",
          time: "Time",
          actions: "Actions",
          viewResults: {
            title: "Results",
            cell: "View"
          },
          viewSummary: "View Summary",
          markAsViewed: "Mark as Viewed",
          callAgain: "Retry Call",
          viewObjectives: "View Objectives",
          deleteCall: "Delete Call"
        },
        tabs: {
          newCalls: "New Calls",
          viewedCalls: "Viewed Calls"
        }
      },
      organisation: {
        patientList: {
          uploadModal: {
            title: "Upload Patient List",
            dropzone: "Drop CSV or XLSX file here or click to select",
            fileSelected: "File selected:",
            removeFile: "Remove file",
            columnMapping: {
              title: "Map CSV Columns",
              name: "Name Column",
              dob: "Date of Birth Column",
              phone: "Phone Number Column (optional)",
              selectColumn: "Select column"
            },
            errors: {
              csvOnly: "Please upload a CSV file",
              requiredColumns: "Please select both name and date of birth columns",
              noData: "No valid patient data to upload",
              uploadFailed: "Failed to upload patient list",
              fileTypeError: "Please upload a CSV or Excel file"
            },
            buttons: {
              upload: "Upload List",
              cancel: "Cancel"
            },
            selectSheet: "Select Excel Sheet",
            loading: "Loading..."
          },
          patientModal: {
            addTitle: "Add New Patient",
            editTitle: "Edit Patient",
            fields: {
              name: "Patient Name *",
              dob: "Date of Birth *",
              phone: "Phone Number"
            },
            errors: {
              required: "Name and Date of Birth are required",
              addFailed: "Failed to add patient",
              updateFailed: "Failed to update patient",
              deleteFailed: "Failed to delete patient"
            },
            buttons: {
              save: "Save",
              cancel: "Cancel"
            },
            deleteConfirm: "Are you sure you want to delete this patient?"
          },
          downloadFilename: "patient_list.csv",
          fields: {
            firstName: "Name",
            dateOfBirth: "Date of Birth",
            phoneNumber: "Phone Number",
            customerName: "Name",
            dontImport: "Don't import",
            actions: "Actions"
          },
          columnMapping: {
            title: "Map Columns",
            description: "Match the columns from your file to the required patient information",
            selectColumn: "Select CSV column",
            availableFields: "Available Fields",
            createNewField: "Create new field",
            cancel: "Cancel",
            continue: "Continue"
          },
          preview: {
            title: "Preview",
            showingRows: "Showing first 5 rows of a total of",
            backToMapping: "Back to Mapping",
            uploading: "Uploading...",
            uploadButton: "Upload Patient List"
          },
          uploadStats: {
            title: "Upload Complete",
            created: "New patients created",
            updated: "Existing patients updated",
            skipped: "Patients skipped",
            skippedReason: "These entries were skipped due to invalid phone numbers",
            close: "Close"
          }
        },
        teamMembers: {
          title: "Team Members",
          invite: {
            placeholder: "Enter email to invite",
            button: "Send Invite"
          }
        },
        create: {
          title: "Create New Organization",
          form: {
            name: "Organization Name",
            addressLine1: "Address Line 1",
            addressLine2: "Address Line 2",
            postcode: "Postcode",
            city: "City",
            country: "Select a country",
            phoneNumbers: {
              title: "Registered Phone Numbers",
              placeholder: "Enter phone number",
              addButton: "+ Add Another Number",
              removeButton: "Remove"
            }
          },
          buttons: {
            create: "Create Organization"
          },
          errors: {
            failed: "Failed to create organization"
          }
        },
        dashboard: {
          loading: "Loading...",
          notFound: "Organisation not found",
          address: {
            title: "Address",
            line1: "Address Line 1",
            line2: "Address Line 2",
            city: "City",
            postcode: "Postcode"
          },
          registeredNumbers: {
            title: "Registered Phone Numbers",
            none: "No registered phone numbers",
            description: "Purchase a phone number to activate patient intake features and make outbound calls from your own number."
          },
          alerts: {
            inviteSuccess: "Invitation sent successfully!",
            inviteFailed: "Failed to send invitation",
            settingsSuccess: "Settings updated successfully!",
            settingsFailed: "Failed to update settings"
          },
          credits: {
            title: "Credits",
            available: "Available Credits",
            callsAvailable: "Equivalent to {{calls}} calls",
            purchase: "Purchase Credits",
            equivalency: "1 credit = {{callsPerCredit}} calls"
          },
          statusFilter: {
            label: "Status",
            all: "All Calls",
            queued: "Queued Calls",
            inProgress: "In Progress",
            processed: "Processed Calls",
            failed: "Failed Calls"
          },
          tabs: {
            general: "General",
            patients: "Patients",
            settings: "Experience Settings"
          }
        },
        success: {
          title: "Organization Created Successfully!",
          subtitle: "Your organization has been set up and is ready to use.",
          returnButton: "Return to Home"
        },
        setup: {
          title: "Welcome! Let's get you started",
          createNew: {
            title: "Create New Organisation",
            description: "Set up your own organisation and start managing your workspace"
          },
          joinExisting: {
            title: "Join an Existing Organisation",
            description: "Ask an administrator of an existing organisation to add your email address",
            note: "Once an administrator adds your email to their organisation, you will automatically get access to it the next time you log in."
          }
        }
      },
      settings: {
        sections: {
          patientIntake: "Patient Intake Settings",
          remoteMonitoring: "Remote Monitoring Settings"
        },
        patientVerification: {
          title: "Patient Verification",
          description: "Enable patient verification step during intake",
          enabled: "Enabled",
          disabled: "Disabled"
        },
        messages: {
          firstMessage: "First Message",
          lastMessage: "Last Message",
          variables: {
            title: "Available Variables",
            patientName: "Patient Name",
            organisationName: "Organisation Name"
          }
        },
        objectives: {
          first: "First Call Objectives",
          last: "Last Call Objectives",
          addObjective: "Add Objective",
          removeObjective: "Remove Objective",
          placeholder: "Enter objective..."
        },
        errors: {
          updateFailed: "Error updating settings"
        },
        buttons: {
          save: "Save Changes"
        },
        unsavedChanges: "Changes not saved",
        patientInformation: {
          title: "Information Available to the Patient",
          placeholder: "Enter information item",
          addInformation: "Add Information"
        }
      },
      remoteMonitoring: {
        title: "Remote Monitoring",
        callType: {
          title: "Select Call Type",
          callNow: {
            title: "Call Now",
            description: "Initiate follow-up call immediately"
          },
          schedule: {
            title: "Schedule Follow-ups",
            description: "Schedule follow-up calls for specific dates and times"
          }
        },
        stepOne: {
          title: "Select Patient(s)",
          searchPlaceholder: "Search patients...",
          noPatients: "No patients found",
          selectedPatientsTitle: "Selected Patients:",
          noPatientsSelected: "No patients selected yet",
          phoneNumberPlaceholder: "Enter phone number",
          invalidPhoneNumber: "Invalid phone number for selected country",
          nextButton: "Next"
        },
        stepTwo: {
          title: "Step 2: Set Follow-up Objectives",
          tabs: {
            manual: "Manual Input",
            preset: "Use Preset"
          },
          manual: {
            instructionsLabel: "Instructions:",
            instructionsPlaceholder: "John has bacterial pneumonia. I'm prescribing amoxicillin 500mg three times a day for 7 days, along with bed rest and increased fluid intake.",
            generateButton: "Generate Objectives",
            objectivesLabel: "Objectives:",
            savePresetButton: "Save as Preset",
            addObjectivePlaceholder: "Add new objective..."
          },
          preset: {
            selectPresetLabel: "Select Preset:",
            selectPresetPlaceholder: "Select a preset",
            selectedObjectivesLabel: "Selected Objectives:",
            addObjectivePlaceholder: "Add new objective..."
          },
          navigation: {
            back: "Back",
            confirm: "Confirm Objectives"
          }
        },
        stepThree: {
          title: "Step 3: Schedule Calls",
          selectedTimes: "Selected Follow-up Times:",
          noDatesSelected: "No dates selected yet",
          navigation: {
            back: "Back",
            scheduling: "Scheduling...",
            schedule: "Schedule Follow-ups"
          }
        },
        scheduler: {
          title: "Schedule Follow-up Call",
          deletePresetConfirm: "Are you sure you want to delete this preset?",
          errors: {
            schedulingError: "Error scheduling calls",
            savingPresetError: "Error saving preset",
            updatingPresetError: "Error updating preset",
            deletingPresetError: "Error deleting preset"
          }
        },
        presetModal: {
          editTitle: "Edit Preset",
          saveTitle: "Save as Preset",
          placeholder: "Enter preset name",
          cancel: "Cancel",
          update: "Update",
          save: "Save"
        },
        results: {
          loading: "Loading...",
          noData: "No data available",
          tabs: {
            results: "Results Summary",
            conversation: "Conversation History"
          },
          table: {
            questions: "Questions",
            assistant: "Assistant",
            patient: "Patient"
          },
          title: "Conversation Results",
          close: "Close"
        },
        dashboard: {
          title: "Call Backlog",
          loading: "Loading...",
          noNumbers: "No registered numbers found for this organisation.",
          dateFilter: {
            from: "From",
            to: "To"
          },
          results: {
            title: "Conversation Results",
            close: "Close"
          },
          statusFilter: {
            label: "Status",
            all: "All Calls",
            queued: "Queued Calls",
            inProgress: "In Progress",
            processed: "Processed Calls",
            failed: "Failed Calls"
          }
        },
        upcomingCalls: {
          title: "Upcoming Follow-up Calls",
          loading: "Loading...",
          tabs: {
            all: "All Calls",
            queue: "In Queue",
            processed: "Processed"
          },
          table: {
            patientName: "Patient Name",
            dateOfBirth: "Date of Birth",
            phoneNumber: "Phone Number",
            enqueuedAt: "Enqueued At",
            status: "Status",
            callSid: "Call SID",
            statuses: {
              processed: "Processed",
              inQueue: "In Queue"
            }
          }
        },
        mainScreen: {
          cards: {
            dashboard: {
              title: "Dashboard",
              description: "View past and scheduled follow up calls"
            },
            createFollowUp: {
              title: "Create Follow Up",
              description: "Set follow up call with patient"
            }
          }
        },
        objectives: {
          title: "Call Objectives",
          table: {
            title: "Objectives Summary",
            questions: "Questions",
            pending: "Pending Response"
          }
        },
        upcomingCalls: {
          table: {
            phoneNumber: "Phone Number",
            status: "Status"
          }
        }
      },
      scribe: {
        title: "Medical Scribe",
        patientSelect: {
          label: "Select a patient",
          placeholder: "Select a patient"
        },
        comingSoon: "Coming Soon...",
        template: {
          label: "Template",
          types: {
            soap: "SOAP",
            apso: "APSO",
            hp: "H&P",
            procedure: "Procedure",
            emergency: "Emergency"
          }
        },
        recording: {
          start: "Start Recording",
          stop: "Stop Recording"
        },
        translation: {
          enable: "Enable Translation",
          active: "Translating to",
          searchPlaceholder: "Search language..."
        },
        copyButton: "Copy All",
        copied: "Copied!"
      },
      phoneNumbers: {
        purchase: {
          title: "Purchase Phone Number",
          description: "Please speak to our sales team at:"
        }
      },
      credits: {
        purchase: {
          title: "Purchase Credits",
          description: "Please contact our sales team at:"
        }
      },
      patientList: {
        title: "Patient List",
        buttons: {
          downloadCsv: "Download CSV",
          addPatient: "Add Patient",
          updateList: "Update Patient List"
        },
        table: {
          headers: {
            name: "Patient Name",
            dob: "Date of Birth",
            phone: "Phone Number",
            notProvided: "Not provided"
          }
        },
        deleteConfirm: "Are you sure you want to delete this patient?",
        errors: {
          updateFailed: "Failed to update patient",
          deleteFailed: "Failed to delete patient"
        }
      },
      common: {
        selectEndDate: "Select end date"
      }
    },
    auth: {
      login: {
        title: "Welcome Back",
        subtitle: "Please login to your account",
        email: "Email",
        password: "Password",
        loginButton: "Login",
        continueWith: "Or continue with",
        continueGoogle: "Continue with Google",
        noAccount: "Don't have an account?",
        signupLink: "Sign up",
        continueMicrosoft: "Continue with Microsoft"
      },
      signup: {
        title: "Create Your Account",
        subtitle: "Join KeepMeCompany to get started",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email Address",
        password: "Password",
        signupButton: "Sign Up",
        continueWith: "Or continue with",
        continueGoogle: "Continue with Google",
        haveAccount: "Already have an account?",
        loginLink: "Login here",
        errors: {
          backendNotConfigured: "Backend URL is not configured",
          registrationFailed: "Registration failed",
          passwordMismatch: "Passwords do not match",
          passwordRequirements: "Please meet all password requirements"
        },
        confirmPassword: "Confirm Password"
      },
      verifyEmail: {
        title: "Verify Your Email",
        subtitle: "We've sent you a verification link",
        instructions: "Please check your email inbox and click the verification link to continue.",
        proceedLogin: "Once verified, you can proceed to login",
        loginButton: "Go to Login",
        noEmail: "Didn't receive the email?",
        resendButton: "Resend verification email"
      }
    },
    welcome: {
      title: "Welcome to KeepMeCompany",
      subtitle: "Please login or sign up to continue",
      loginButton: "Login",
      signupButton: "Sign Up"
    },
    common: {
      close: "Close",
      selectEndDate: "Select end date"
    }
  },
  es: {
    workspace: {
      welcome: "Hola {name}, Bienvenido a {organisation}",
      cards: {
        patientIntake: {
          title: "Llamadas Entrantes",
          description: "Gestiona qué responder a tus pacientes cuando llamen",
          action: "Ir a Admisión de Pacientes →"
        },
        remoteMonitoring: {
          title: "Llamar Pacientes",
          description: "Recordatorios, avisos o seguimientos médicos",
          action: "Ir a Monitoreo Remoto →"
        },
        scribe: {
          title: "Escriba Médico",
          description: "Transcriba sus consultas en tiempo real",
          action: "Ir a Escriba Médico →"
        },
        organisation: {
          title: "Panel de la Organización",
          description: "Ajuste de créditos, manejo de pacientes y otros",
          action: "Ir al Panel de la Organización →"
        }
      },
      layout: {
        selectOrg: "Seleccionar Organización",
        createNewOrg: "Crear nueva organización",
        home: "Inicio",
        signOut: "Cerrar sesión",
        menu: {
          overview: "Vista General",
          patientIntake: "Admisión de Pacientes",
          remoteMonitoring: "Monitoreo Remoto",
          organisationDashboard: "Panel de la Organización"
        }
      },
      intake: {
        title: "Admisión de Pacientes",
        liveDashboard: {
          title: "Registro de Llamadas",
          noNumbers: "No se encontraron números registrados para esta organización.",
          loading: "Cargando...",
          dateFilter: {
            from: "Desde",
            to: "Hasta"
          }
        },
        cards: {
          liveDashboard: {
            title: "Panel en Vivo",
            description: "Ver datos de admisión en tiempo real"
          }
        },
        phoneNumberRequired: "Número de teléfono requerido",
        purchaseNumber: "Comprar Número",
        noPhoneNumberMessage: "Necesitas comprar un número de teléfono para comenzar a usar el sistema de admisión de pacientes.",
        cards: {
          liveDashboard: {
            title: "Live Dashboard",
            description: "Monitorear solicitudes de pacientes en tiempo real"
          }
        }
      },
      triageDashboard: {
        table: {
          patientName: "Nombre",
          dateOfBirth: "Fecha de Nacimiento",
          phoneNumber: "Teléfono",
          summary: "Resumen",
          callTimestamp: "Fecha de Llamada",
          time: "Hora",
          actions: "Acciones",
          viewResults: {
            title: "Resultados",
            cell: "Ver"
          },
          viewSummary: "Ver Resumen",
          markAsViewed: "Marcar como Visto",
          callAgain: "Reintentar Llamada",
          viewObjectives: "Ver Objetivos",
          deleteCall: "Eliminar Llamada"
        },
        tabs: {
          newCalls: "Llamadas Nuevas",
          viewedCalls: "Llamadas Vistas"
        }
      },
      organisation: {
        patientList: {
          uploadModal: {
            title: "Subir Lista de Pacientes",
            dropzone: "Suelta el archivo CSV or XLSX aquí o haz clic para seleccionar",
            fileSelected: "Archivo seleccionado:",
            removeFile: "Eliminar archivo",
            errors: {
              csvOnly: "Por favor sube un archivo CSV",
              requiredColumns: "Por favor selecciona las columnas de nombre y fecha de nacimiento",
              noData: "No hay datos válidos de pacientes para subir",
              uploadFailed: "Error al subir la lista de pacientes",
              fileTypeError: "Por favor sube un archivo CSV o Excel"
            },
            buttons: {
              upload: "Subir Lista",
              cancel: "Cancelar"
            },
            selectSheet: "Seleccionar Hoja de Excel",
            loading: "Cargando..."
          },
          patientModal: {
            addTitle: "Agregar Nuevo Paciente",
            editTitle: "Editar Paciente",
            fields: {
              name: "Nombre del Paciente *",
              dob: "Fecha de Nacimiento *",
              phone: "Número de Teléfono"
            },
            errors: {
              required: "El nombre y la fecha de nacimiento son requeridos",
              addFailed: "Error al agregar paciente",
              updateFailed: "Error al actualizar paciente",
              deleteFailed: "Error al eliminar paciente"
            },
            buttons: {
              save: "Guardar",
              cancel: "Cancelar"
            },
            deleteConfirm: "¿Estás seguro de que quieres eliminar este paciente?"
          },
          downloadFilename: "lista_pacientes.csv",
          fields: {
            firstName: "Nombre",
            dateOfBirth: "Fecha de Nacimiento",
            phoneNumber: "Número de Teléfono",
            customerName: "Nombre",
            dontImport: "No importar",
            actions: "Acciones"
          },
          columnMapping: {
            title: "Mapear Columnas",
            description: "Relaciona las columnas de tu archivo con la información requerida del paciente",
            selectColumn: "Seleccionar columna CSV",
            availableFields: "Campos Disponibles",
            createNewField: "Crear nuevo campo",
            cancel: "Cancelar",
            continue: "Continuar"
          },
          preview: {
            title: "Vista Previa",
            showingRows: "Mostrando las primeras 5 filas de un total de",
            backToMapping: "Volver al Mapeo",
            uploading: "Subiendo...",
            uploadButton: "Subir Lista de Pacientes"
          },
          uploadStats: {
            title: "Carga Completa",
            created: "Nuevos pacientes creados",
            updated: "Pacientes existentes actualizados",
            skipped: "Pacientes omitidos",
            skippedReason: "Estas entradas se omitieron debido a números de teléfono inválidos",
            close: "Cerrar"
          }
        },
        teamMembers: {
          title: "Miembros del Equipo",
          invite: {
            placeholder: "Ingrese correo para invitar",
            button: "Enviar Invitación"
          }
        },
        create: {
          title: "Crear Nueva Organización",
          form: {
            name: "Nombre de la Organización",
            addressLine1: "Dirección Línea 1",
            addressLine2: "Dirección Línea 2",
            postcode: "Código Postal",
            city: "Ciudad",
            country: "Seleccionar país",
            phoneNumbers: {
              title: "Números de Teléfono Registrados",
              placeholder: "Ingrese número de teléfono",
              addButton: "+ Agregar Otro Número",
              removeButton: "Eliminar"
            }
          },
          buttons: {
            create: "Crear Organización"
          },
          errors: {
            failed: "Error al crear la organización"
          }
        },
        dashboard: {
          loading: "Cargando...",
          notFound: "Organización no encontrada",
          address: {
            title: "Dirección",
            line1: "Dirección Línea 1",
            line2: "Dirección Línea 2",
            city: "Ciudad",
            postcode: "Código Postal"
          },
          registeredNumbers: {
            title: "Números de Teléfono Registrados",
            none: "Sin números de teléfono registrados",
            description: "Compre un número de teléfono para activar las funciones de admisión de pacientes y realizar llamadas salientes desde su propio número."
          },
          alerts: {
            inviteSuccess: "¡Invitación enviada exitosamente!",
            inviteFailed: "Error al enviar la invitación",
            settingsSuccess: "¡Configuración actualizada exitosamente!",
            settingsFailed: "Error al actualizar la configuración"
          },
          credits: {
            title: "Créditos",
            available: "Créditos Disponibles",
            callsAvailable: "Equivalente a {{calls}} llamadas",
            purchase: "Comprar Créditos",
            equivalency: "1 crédito = {{callsPerCredit}} llamadas"
          },
          statusFilter: {
            label: "Status",
            all: "Todas las Llamadas",
            queued: "Llamadas en Cola",
            inProgress: "En Progreso",
            processed: "Llamadas Procesadas",
            failed: "Llamadas Fallidas"
          },
          tabs: {
            general: "General",
            patients: "Pacientes",
            settings: "Ajustes de Experiencia"
          }
        },
        success: {
          title: "¡Organización Creada Exitosamente!",
          subtitle: "Su organización ha sido configurada y está lista para usar.",
          returnButton: "Volver al Inicio"
        },
        setup: {
          title: "Bienvenido! Vamos a empezar",
          createNew: {
            title: "Crear Nueva Organización",
            description: "Configura tu propia organización y empieza a gestionar tu espacio de trabajo"
          },
          joinExisting: {
            title: "Unirse a una Organización Existente",
            description: "Preguntar al administrador de una organización existente para agregar tu dirección de correo electrónico",
            note: "Una vez que un administrador agrega tu correo electrónico a su organización, automáticamente tendrás acceso a ella la próxima vez que te conectes."
          }
        },
        common: {
          selectEndDate: "Seleccione fecha final"
        }
      },
      settings: {
        sections: {
          patientIntake: "Configuración de Admisión",
          remoteMonitoring: "Configuración de Monitoreo"
        },
        patientVerification: {
          title: "Verificación de Paciente",
          description: "Habilitar paso de verificación durante la admisión",
          enabled: "Habilitado",
          disabled: "Deshabilitado"
        },
        messages: {
          firstMessage: "Primer Mensaje",
          lastMessage: "Último Mensaje",
          variables: {
            title: "Variables Disponibles",
            patientName: "Nombre del Paciente",
            organisationName: "Nombre de la Organización"
          }
        },
        objectives: {
          first: "Primeros Objetivos de la Llamada",
          last: "Últimos Objetivos de la Llamada",
          addObjective: "Agregar Objetivo",
          removeObjective: "Eliminar Objetivo",
          placeholder: "Ingrese objetivo..."
        },
        errors: {
          updateFailed: "Error al actualizar la configuración"
        },
        buttons: {
          save: "Guardar Cambios"
        },
        unsavedChanges: "Cambios sin guardar",
        patientInformation: {
          title: "Información Disponible al Paciente",
          placeholder: "Ingrese información",
          addInformation: "Agregar Información"
        }
      },
      remoteMonitoring: {
        title: "Monitoreo Remoto",
        callType: {
          title: "Seleccionar Tipo de Llamada",
          callNow: {
            title: "Llamar Ahora",
            description: "Iniciar llamada de seguimiento inmediatamente"
          },
          schedule: {
            title: "Programar Seguimientos",
            description: "Programar llamadas de seguimiento para fechas y horas específicas"
          }
        },
        stepOne: {
          title: "Seleccionar Paciente(s)",
          searchPlaceholder: "Buscar pacientes...",
          noPatients: "No se encontraron pacientes",
          selectedPatientsTitle: "Pacientes Seleccionados:",
          noPatientsSelected: "Ningún paciente seleccionado aún",
          phoneNumberPlaceholder: "Ingrese número de teléfono",
          invalidPhoneNumber: "Número de teléfono inválido para el país seleccionado",
          nextButton: "Siguiente"
        },
        stepTwo: {
          title: "Paso 2: Establecer Objetivos de Seguimiento",
          tabs: {
            manual: "Entrada Manual",
            preset: "Usar Preestablecido"
          },
          manual: {
            instructionsLabel: "Instrucciones:",
            instructionsPlaceholder: "John tiene neumonía bacteriana. Estoy prescribiendo amoxicilina 500mg tres veces al día durante 7 días, junto con reposo en cama y mayor ingesta de líquidos.",
            generateButton: "Generar Objetivos",
            objectivesLabel: "Objetivos:",
            savePresetButton: "Guardar como Preestablecido",
            addObjectivePlaceholder: "Agregar nuevo objetivo..."
          },
          preset: {
            selectPresetLabel: "Seleccionar Preestablecido:",
            selectPresetPlaceholder: "Seleccionar un preestablecido",
            selectedObjectivesLabel: "Objetivos Seleccionados:",
            addObjectivePlaceholder: "Agregar nuevo objetivo..."
          },
          navigation: {
            back: "Atrás",
            confirm: "Confirmar Objetivos"
          }
        },
        stepThree: {
          title: "Paso 3: Programar Llamadas",
          selectedTimes: "Horarios de Seguimiento Seleccionados:",
          noDatesSelected: "Aún no hay fechas seleccionadas",
          navigation: {
            back: "Atrás",
            scheduling: "Programando...",
            schedule: "Programar Seguimientos"
          }
        },
        scheduler: {
          title: "Programar Llamada de Seguimiento",
          deletePresetConfirm: "¿Está seguro de que desea eliminar este preset?",
          errors: {
            schedulingError: "Error al programar llamadas",
            savingPresetError: "Error al guardar preset",
            updatingPresetError: "Error al actualizar preset",
            deletingPresetError: "Error al eliminar preset"
          }
        },
        presetModal: {
          editTitle: "Editar Preset",
          saveTitle: "Guardar como Preset",
          placeholder: "Ingrese nombre del preset",
          cancel: "Cancelar",
          update: "Actualizar",
          save: "Guardar"
        },
        results: {
          loading: "Cargando...",
          noData: "No hay datos disponibles",
          tabs: {
            results: "Resumen de Resultados",
            conversation: "Historial de Conversación"
          },
          table: {
            questions: "Preguntas",
            assistant: "Asistente",
            patient: "Paciente"
          },
          title: "Resultados de la Conversación",
          close: "Cerrar"
        },
        dashboard: {
          title: "Registro de Llamadas",
          loading: "Cargando...",
          noNumbers: "No se encontraron números registrados para esta organización.",
          dateFilter: {
            from: "Desde",
            to: "Hasta"
          },
          results: {
            title: "Resultados de la Conversación",
            close: "Cerrar"
          },
          statusFilter: {
            label: "Status",
            all: "Todas las Llamadas",
            queued: "Llamadas en Cola",
            inProgress: "En Progreso",
            processed: "Llamadas Procesadas",
            failed: "Llamadas Fallidas"
          }
        },
        upcomingCalls: {
          title: "Próximas Llamadas de Seguimiento",
          loading: "Cargando...",
          tabs: {
            all: "Todas las Llamadas",
            queue: "En Cola",
            processed: "Procesadas"
          },
          table: {
            patientName: "Nombre",
            dateOfBirth: "Fecha de Nacimiento",
            phoneNumber: "Teléfono",
            enqueuedAt: "En Cola Desde",
            status: "Estado",
            callSid: "ID de Llamada",
            statuses: {
              processed: "Procesada",
              inQueue: "En Cola"
            }
          }
        },
        mainScreen: {
          cards: {
            dashboard: {
              title: "Panel de Control",
              description: "Ver datos de seguimientos anteriores y programados"
            },
            createFollowUp: {
              title: "Crear Seguimiento",
              description: "Programar llamada de seguimiento con paciente"
            }
          }
        },
        phoneNumbers: {
          purchase: {
            title: "Comprar Número de Teléfono",
            description: "Por favor, contacte a nuestro equipo de ventas en:"
          }
        },
        credits: {
          purchase: {
            title: "Comprar Créditos",
            description: "Por favor, contacte a nuestro equipo de ventas en:"
          }
        },
        objectives: {
          title: "Objetivos de Llamada",
          table: {
            title: "Objetivos Summary",
            questions: "Preguntas",
            pending: "Respuesta Pendiente"
          }
        },
        upcomingCalls: {
          table: {
            phoneNumber: "Número de Teléfono",
            status: "Estado"
          }
        }
      },
      scribe: {
        title: "Escriba Médico",
        patientSelect: {
          label: "Seleccionar paciente",
          placeholder: "Seleccionar paciente"
        },
        comingSoon: "Próximamente...",
        template: {
          label: "Plantilla",
          types: {
            soap: "SOAP",
            apso: "APSO",
            hp: "H&P",
            procedure: "Procedimiento",
            emergency: "Emergencia"
          }
        },
        recording: {
          start: "Iniciar Grabación",
          stop: "Detener Grabación"
        },
        translation: {
          enable: "Habilitar Traducción",
          active: "Traduciendo a",
          searchPlaceholder: "Buscar idioma..."
        },
        copyButton: "Copiar Todo",
        copied: "¡Copiado!"
      },
      credits: {
        purchase: {
          title: "Comprar Créditos",
          description: "Por favor, contacte a nuestro equipo de ventas en:"
        }
      },
      patientList: {
        title: "Lista de Pacientes",
        buttons: {
          downloadCsv: "Descargar CSV",
          addPatient: "Agregar Pacientes",
          updateList: "Cargar Lista de Pacientes"
        },
        table: {
          headers: {
            name: "Nombre",
            dob: "Fecha de Nacimiento",
            phone: "Número de Teléfono",
            notProvided: "N/A"
          }
        },
        deleteConfirm: "Seguro que desea eliminar este paciente?",
        errors: {
          updateFailed: "Error al actualizar paciente",
          deleteFailed: "Error al eliminar paciente"
        },
        preview: {
          title: "Vista Previa",
          showingRows: "Mostrando las primeras 5 filas de un total de",
          backToMapping: "Volver al Mapeo",
          uploading: "Subiendo...",
          uploadButton: "Subir Lista de Pacientes"
        }
      },
      common: {
        selectEndDate: "Seleccione fecha final"
      }
    },
    auth: {
      login: {
        title: "Bienvenido de Nuevo",
        subtitle: "Por favor inicia sesión en tu cuenta",
        email: "Correo electrónico",
        password: "Contraseña",
        loginButton: "Iniciar Sesión",
        continueWith: "O continuar con",
        continueGoogle: "Continuar con Google",
        noAccount: "¿No tienes una cuenta?",
        signupLink: "Regístrate",
        continueMicrosoft: "Continuar con Microsoft"
      },
      signup: {
        title: "Crea tu Cuenta",
        subtitle: "Únete a KeepMeCompany para comenzar",
        firstName: "Nombre",
        lastName: "Apellido",
        email: "Correo electrónico",
        password: "Contraseña",
        signupButton: "Registrarse",
        continueWith: "O continuar con",
        continueGoogle: "Continuar con Google",
        haveAccount: "¿Ya tienes una cuenta?",
        loginLink: "Inicia sesión aquí",
        errors: {
          backendNotConfigured: "URL del backend no configurada",
          registrationFailed: "Registro fallido",
          passwordMismatch: "Contraseñas no coinciden",
          passwordRequirements: "Por favor cumpla con todos los requisitos de contraseña"
        },
        confirmPassword: "Confirmar Contraseña"
      },
      verifyEmail: {
        title: "Verifica tu Correo",
        subtitle: "Te hemos enviado un enlace de verificación",
        instructions: "Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para continuar.",
        proceedLogin: "Una vez verificado, puedes proceder a iniciar sesión",
        loginButton: "Ir a Iniciar Sesión",
        noEmail: "¿No recibiste el correo?",
        resendButton: "Reenviar correo de verificación"
      }
    },
    welcome: {
      title: "Bienvenido a KeepMeCompany",
      subtitle: "Por favor inicia sesión o regístrate para continuar",
      loginButton: "Iniciar Sesión",
      signupButton: "Registrarse"
    },
    common: {
      close: "Cerrar",
      selectEndDate: "Seleccione fecha final"
    }
  }
};