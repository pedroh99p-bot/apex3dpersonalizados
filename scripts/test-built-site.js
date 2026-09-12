import { spawnSync } from 'node:child_process';
for(const file of ['smoke','mvp-smoke','visual-smoke','conversion-smoke']){
  const result=spawnSync(process.execPath,['tests/'+file+'.js'],{env:{...process.env,APEX_TEST_BUILD:'1'},stdio:'inherit',windowsHide:true});
  if(result.status!==0)process.exit(result.status||1);
}
