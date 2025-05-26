from crontab import CronTab

cron = CronTab(user=True)
cron.remove_all(comment='captura_raspberry')
cron.write()
print("❌ Todas las tareas de captura eliminadas.")