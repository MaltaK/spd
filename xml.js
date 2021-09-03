bool SpdSettings::readObjectsSettings( const QString & settingsPath, ControlInterface * iface )
{
    QString errorStr;
    int errorLine, errorColumn;
    QDir dir;
    dir.mkpath(settingsPath);

    QFile file(settingsPath+SETTINGS_FNAME);
    if (!file.open(QIODevice::ReadOnly))
    {
        qWarning() << settingsPath+SETTINGS_FNAME + QString::fromUtf8(" не может быть открыт!\n Проверьте настройки!");
        //emit addMessageToLog("Файл настроей " + SETTINGS_FULL_FNAME + " не найден");
        return false;
    }

    QDomDocument* ddSettings = new QDomDocument();
    if(!ddSettings->setContent(&file, false, &errorStr, &errorLine, &errorColumn))
    {
        qWarning() <<  QString::fromUtf8(" Не верный формат ") + settingsPath+SETTINGS_FNAME;
        qWarning() <<  QString::fromUtf8(" Ошибка : ") + errorStr + QString::fromUtf8(" строка : ") + errorLine +
                       QString::fromUtf8(" символ : ") + errorColumn;
        delete ddSettings;
        return false;
    }

    file.seek(0);
    QString XMLObjectsSettings(file.readAll());

    QDomElement deRoot = ddSettings->documentElement();
    QDomNode dnFormations = deRoot.firstChild();
    while(!dnFormations.isNull() && (dnFormations.toElement().tagName() == "OBJECT"))
    {
        SettingsObjects_t setObj;
        setObj.m_objID = dnFormations.toElement().attribute("objectID");
        setObj.m_name = dnFormations.toElement().attribute("name");
        if (setObj.m_objID.isEmpty())
            continue;

        QDomNode objectSettinsNode = dnFormations.firstChild();
        while (!objectSettinsNode.isNull())
        {
            if (objectSettinsNode.toElement().tagName() == "INTERFACES")
            {
                QDomNode interface = objectSettinsNode.firstChild();
                while (!interface.isNull())
                {
                    Inteface inter_face;
                    if (interface.toElement().attribute("ip").isEmpty())
                        continue;
                    inter_face.m_host.setAddress(interface.toElement().attribute("ip"));
                    inter_face.m_port = interface.toElement().attribute("port").isEmpty() ? DEFAULT_PORT : dnFormations.toElement().attribute("port").toUShort();
                    setObj.m_interfaces.append(inter_face);
                    interface = interface.nextSibling();
                }

            }
            if (objectSettinsNode.toElement().tagName() == "USERS")
            {
                QDomNode userNode = objectSettinsNode.firstChild();
                while (!userNode.isNull())
                {
                    User_t user;
                    user.ip.setAddress(userNode.toElement().attribute("ip"));
                    user.name = userNode.toElement().attribute("name");
                    setObj.m_users.append(user);
                    userNode = userNode.nextSibling();
                }

            }

            if (objectSettinsNode.toElement().tagName() == "LOGICAL_NAMES")
            {
                readLogicalNames(&setObj, objectSettinsNode);
            }

            objectSettinsNode = objectSettinsNode.nextSibling();
        }

        setObj.m_curentInterface = (setObj.m_interfaces.count()>0) ? 0 : -1;

        setObj.m_port = dnFormations.toElement().attribute("port").toUInt();
        if (dnFormations.toElement().attribute("type").toInt() == 1)
        {
            setObj.m_isCurrent = true;
        }
        else
            setObj.m_isCurrent = false;
        dnFormations = dnFormations.nextSibling();
       // readLogicalNames(settingsPath, &setObj);
        setObj.m_XMLobjectsSettings = XMLObjectsSettings;
        iface->addSpdServer(setObj);
    }    

    delete ddSettings;
    return true;
}


struct SettingsObjects_t
{
    void clear()
    {
        m_logicalNames.clear();
    }

    LogicalName_t getLogicalByName(const QString & logicalName)
    {
        auto it = m_logicalNames.find(logicalName);
        return (it != m_logicalNames.end()) ? it.value() : LogicalName_t();
    }



    QString             m_objID;
    QString             m_name;
    QString             m_comment;
    QList<Inteface>     m_interfaces;
    QList<User_t>       m_users;
    quint16             m_port;
    bool                m_isCurrent;
    qint16              m_curentInterface;
    QMap<QString, LogicalName_t> m_logicalNames;
    QString             m_XMLobjectsSettings;
};

bool SpdSettings::readLogicalNames( SettingsObjects_t * setObj, QDomNode logicalNamesNode )
{
    //setObj->clear();

    QDomNode dnLogicalNames = logicalNamesNode.firstChild();
    while(!dnLogicalNames.isNull() && (dnLogicalNames.toElement().tagName() == "LOGICAL_NAME"))
    {
        LogicalName_t logicalName;
        logicalName.m_logicalName = dnLogicalNames.toElement().attribute("logicalName");
        logicalName.m_object = dnLogicalNames.toElement().attribute("destObject");
        logicalName.m_host = dnLogicalNames.toElement().attribute("destHost");
        logicalName.m_name = dnLogicalNames.toElement().attribute("destName");

        Handler_t handler;
        QDomNode dnHandler = dnLogicalNames.firstChild();

        if (!dnHandler.isNull() && dnHandler.toElement().tagName() == "HANDLER")
        {
            while (!dnHandler.isNull())
            {
                QDomNode dnParams = dnHandler.firstChild();
                while (!dnParams.isNull())
                {
                    if (dnParams.toElement().nodeName() == "DO_COPY")
                        handler.m_doCopy = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "COPY_PATH")
                        handler.m_copyPath = dnParams.toElement().text();
                    else if (dnParams.toElement().nodeName() == "CHANGE_NAME")
                        handler.m_changeName = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "FILE_NAME")
                        handler.m_fileName = dnParams.toElement().text();
                    else if (dnParams.toElement().nodeName() == "OVERWRITE")
                        handler.m_overwrite = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "DELETE_SRC")
                        handler.m_deleteSrc = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "EXEC_APP")
                        handler.m_execApp = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "APP_NAME")
                        handler.m_appName = dnParams.toElement().text();
                    else if (dnParams.toElement().nodeName() == "WAIT_EXEC")
                        handler.m_waitExec = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "WAIT_TIME")
                        handler.m_waitTime = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "PASSED_FULL_FILE_NAME")
                        handler.m_paramFullFileName = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "PASSED_FILE_NAME")
                        handler.m_paramFileName = dnParams.toElement().text().toInt();
                    else if (dnParams.toElement().nodeName() == "PASSED_LOGICAL_NAME")
                        handler.m_paramLogicalName = dnParams.toElement().text().toInt();

                    dnParams = dnParams.nextSibling();
                }
                dnHandler = dnHandler.nextSibling();
                logicalName.m_handlers.append(handler);
            }

        }
        if (setObj)
            setObj->m_logicalNames.insert(logicalName.m_logicalName, logicalName);
        dnLogicalNames = dnLogicalNames.nextSibling();
    }
    return true;
}


