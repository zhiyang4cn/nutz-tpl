package tpl.admin.api.entities.builtin;

import java.util.List;

import org.nutz.NutRuntimeException;
import org.nutz.dao.Cnd;
import org.nutz.dao.Dao;
import org.nutz.dao.util.cri.SimpleCriteria;
import org.nutz.ioc.annotation.InjectName;
import org.nutz.mvc.adaptor.JsonAdaptor;
import org.nutz.mvc.annotation.AdaptBy;
import org.nutz.mvc.annotation.At;
import org.nutz.mvc.annotation.DELETE;
import org.nutz.mvc.annotation.GET;
import org.nutz.mvc.annotation.POST;
import org.nutz.mvc.annotation.PUT;

import tpl.authc.DbAuthenticationInfo;
import tpl.entities.EntityDataSource;

@InjectName("api.entities.builtinAccountDsModule")
@At("/builtin/account")
public class AccountDsModule {
	private Dao dao;

	private SimpleCriteria createCriteria() {
		SimpleCriteria cri = Cnd.cri();
		cri.asc("dataSourceName");
		return cri;
	}

	@At("/ds/da/?")
	@GET
	public EntityDataSource get(String name) {
		return dao.fetchx(EntityDataSource.class, DbAuthenticationInfo.class, name);
	}
	
	@At("/ds/da")
	@POST
	@AdaptBy(type=JsonAdaptor.class)
	public EntityDataSource add(EntityDataSource def) {
		if (get(def.getDataSourceName()) != null) throw new NutRuntimeException("Duplicated entry.");
		return dao.insert(def);
	}
	
	@At("/ds/da")
	@PUT
	@AdaptBy(type=JsonAdaptor.class)
	public EntityDataSource update(EntityDataSource def) {
		throw new NutRuntimeException("Not allowed for updating.");
	}
	
	@At("/ds/da/?")
	@DELETE
	public EntityDataSource delete(String name) {
		EntityDataSource def = get(name);
		if (def != null)
			dao.deletex(EntityDataSource.class, DbAuthenticationInfo.class.getName(), name);
		return def;
	}
	
	@At("/ds/")
	@GET
	public List<EntityDataSource> all() {
		return dao.query(EntityDataSource.class, createCriteria());
	}

	public void setDao(Dao dao) {
		this.dao = dao;
	}
}
